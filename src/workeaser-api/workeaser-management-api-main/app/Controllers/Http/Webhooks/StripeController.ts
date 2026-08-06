import Env from '@ioc:Adonis/Core/Env';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Logger from '@ioc:Adonis/Core/Logger';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database';
import CoworkStripeAccount from 'App/Models/CoworkStripeAccount';
import Payment from 'App/Models/Payment';
import PaymentHistory from 'App/Models/PaymentHistory';
import InvoiceService from 'App/Services/Cowork/InvoiceService';
// HF-SPRINT-A-05: webhooks subscription.* + invoice.paid/payment_failed
import StripeSubscriptionService from 'App/Services/Cowork/StripeSubscriptionService';
// HF-SPRINT-F-08: Slack notifications em eventos críticos
import SlackNotificationService from 'App/Services/SlackNotificationService';
// HF-SPRINT-G-02: anti-replay protection
import { checkTimestampSkew, isReplayed, registerNonce } from 'App/Utils/WebhookReplayProtection';
// HF-SPRINT-H-09: dead-letter queue pra retry durável de webhooks falhados
import WebhookRetryQueueService from 'App/Services/WebhookRetryQueueService';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { IntegrationServiceEnum, InvoiceStatusEnum, PaymentStatusEnum } from 'Contracts/enums';
import Stripe from 'stripe';

interface ChargeInterface {
  gatewayId: string;
  status: string;
  amountCaptured: number;
  amountRefunded: number;
  failureCode?: string;
  failureMessage?: string;
  sellerMessage?: string;
}

export default class StripeController {
  public async store({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    const sig = request.header('stripe-signature') as string;
    const requestBody = request.raw() as string;
    let event;
    const WEBHOOK_SECRET_KEY = Env.get('STRIPE_WEBHOOK_SECRET_KEY') as string | undefined;
    const STRIPE_API_KEY = Env.get('STRIPE_SECRET_KEY') as string | undefined;

    if (!WEBHOOK_SECRET_KEY || !STRIPE_API_KEY) {
      response
        .status(503)
        .send('Stripe webhook not configured (missing STRIPE_WEBHOOK_SECRET_KEY or STRIPE_SECRET_KEY)');
      return;
    }

    try {
      const stripe = new Stripe(STRIPE_API_KEY, {
        apiVersion: '2020-08-27'
      });
      event = stripe.webhooks.constructEvent(requestBody, sig, WEBHOOK_SECRET_KEY);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // HF-SPRINT-G-02: anti-replay (timestamp + nonce).
    // Stripe envia `created` no payload (unix seconds). Verifica window 5min.
    if (!checkTimestampSkew(event.created)) {
      Logger.warn({ eventId: event.id, created: event.created }, 'Stripe webhook fora da janela (replay?)');
      response.status(401).send('Webhook timestamp out of window');
      return;
    }
    if (isReplayed(event.id)) {
      Logger.warn({ eventId: event.id }, 'Stripe webhook já processado (replay ignorado)');
      response.status(200).send('ok'); // 200 pra Stripe não re-tentar
      return;
    }

    const type = event.type;
    const data = event.data.object;
    const trx = await Database.transaction();

    try {
      // General actions
      switch (data.object) {
        case 'account':
          await this.handleAccount(data, trx);
          break;
      }

      // Specific actions
      switch (type) {
        case 'charge.succeeded':
          await this.handleChargeSucceeded(data, trx);
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(data, trx);
          break;
        case 'account.external_account.created':
          await this.handleCreateBankAccount(data, trx);
          break;
        // HF-SPRINT-A-05: subscription lifecycle
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.trial_will_end':
          await this.handleSubscriptionEvent(data);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(data);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(data);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(data);
          break;
        default:
          // Eventos não tratados são acknowledged silenciosamente (200 OK no return)
          // pra Stripe não ficar re-enviando. Logger registra pra debug.
          Logger.debug({ event_type: type }, 'Stripe webhook event não tratado');
          break;
      }

      await trx.commit();
      // HF-SPRINT-G-02: registra nonce APÓS commit bem-sucedido
      registerNonce(event.id);
      return responseWithSuccess(response, { message: 'Ok' });
    } catch (error) {
      console.log(error);
      await trx.rollback();
      // HF-SPRINT-H-09: enqueue na DLQ pra retry com backoff (Stripe re-tenta poucas vezes)
      try {
        await WebhookRetryQueueService.enqueueFailedEvent('stripe', type, event.id, data, error);
      } catch (qErr) {
        Logger.error({ qErr, eventId: event.id }, 'Falha ao enfileirar webhook na DLQ');
      }
      return responseWithError(response, error.message);
    }
  }

  private async handleCreateBankAccount(data: any, trx: TransactionClientContract) {
    const stripeAccount = await CoworkStripeAccount.query()
      .where('account_id', data.account)
      .first();

    if (!stripeAccount) {
      return;
    }

    stripeAccount.needExternalAccount = false;
    await stripeAccount.useTransaction(trx).save();
  }

  private async handleAccount(data: any, trx: TransactionClientContract) {
    const stripeAccount = await CoworkStripeAccount.query().where('account_id', data.id).first();

    if (stripeAccount && data.requirements) {
      if (data.requirements.pending_verification.length) {
        stripeAccount.inReview = true;
      } else {
        stripeAccount.inReview = false;
      }

      if (data.requirements.currently_due.includes('external_account')) {
        stripeAccount.needExternalAccount = true;
      } else {
        stripeAccount.needExternalAccount = false;
      }

      if (
        data.requirements.errors.length ||
        (data.requirements.past_due.length && data.requirements.past_due[0] !== 'external_account')
      ) {
        stripeAccount.needUpdate = true;
      } else {
        stripeAccount.needUpdate = false;
      }

      await stripeAccount.useTransaction(trx).save();
    }
  }

  private async handleChargeSucceeded(data: any, trx: TransactionClientContract) {
    const dataNormalized: ChargeInterface = this.normalizeChargeEvent(data);

    const payment = await Payment.query()
      .preload('invoice')
      .where('integration_service', IntegrationServiceEnum.STRIPE)
      .where('gateway_id', dataNormalized.gatewayId)
      .first();

    if (!payment || !payment.invoice) return;

    await PaymentHistory.create(
      {
        paymentId: payment.id,
        status: dataNormalized.status,
        failureCode: dataNormalized.failureCode,
        failureMessage: dataNormalized.failureMessage,
        sellerMessage: dataNormalized.sellerMessage,
        amount: dataNormalized.amountCaptured
      },
      { client: trx }
    );

    payment.available = dataNormalized.amountCaptured;
    payment.status = PaymentStatusEnum.SUCCEEDED;
    const alreadyPaid = await InvoiceService.calculatePaymentsInvoices(payment.invoice.id);
    const totalPaid = alreadyPaid + dataNormalized.amountCaptured;
    let totalInvoice = 0;
    let newStatus;

    // If invoice is overdue
    if (payment.invoice.dueDate.startOf('day') < payment.createdAt.startOf('day')) {
      totalInvoice = payment.invoice.total + payment.invoice.totalTaxesOverdue;
    } else {
      totalInvoice = payment.invoice.total;
    }

    // Update invoice status
    if (totalPaid >= totalInvoice) {
      newStatus = InvoiceStatusEnum.FULLY_PAID;
    } else {
      newStatus = InvoiceStatusEnum.PARTLY_PAID;
    }

    if (payment.applicationFee) {
      payment.invoice.applicationFeePaid = true;
    }

    await payment.useTransaction(trx).save();
    await payment.invoice.useTransaction(trx).save();
    await InvoiceService.updateInvoiceStatus(payment.invoice.id, newStatus, false, trx);
  }

  private async handleChargeRefunded(data: any, trx: TransactionClientContract) {
    const dataNormalized: ChargeInterface = this.normalizeChargeEvent(data);

    const payment = await Payment.query()
      .preload('invoice')
      .where('integration_service', IntegrationServiceEnum.STRIPE)
      .where('gateway_id', dataNormalized.gatewayId)
      .first();

    if (!payment || !payment.invoice) return;

    await PaymentHistory.create(
      {
        paymentId: payment.id,
        status: dataNormalized.status,
        failureCode: dataNormalized.failureCode,
        failureMessage: dataNormalized.failureMessage,
        sellerMessage: dataNormalized.sellerMessage,
        amount: -1 * (dataNormalized.amountRefunded - payment.available)
      },
      { client: trx }
    );

    payment.available = dataNormalized.amountCaptured - dataNormalized.amountRefunded;
    const alreadyPaid = await InvoiceService.calculatePaymentsInvoices(payment.invoice.id);
    const totalPaid = alreadyPaid - dataNormalized.amountRefunded;
    let newStatus;

    // Update invoice status
    if (totalPaid <= 0) {
      newStatus = InvoiceStatusEnum.FULLY_REFUNDED;
    } else {
      newStatus = InvoiceStatusEnum.PARTLY_REFUNDED;
    }

    // Update payment status
    if (payment.available === 0) {
      payment.status = PaymentStatusEnum.REFUNDED;
    } else if (payment.available > 0) {
      payment.status = PaymentStatusEnum.PARTLY_REFUNDED;
    }

    await payment.useTransaction(trx).save();
    await payment.invoice.useTransaction(trx).save();
    await InvoiceService.updateInvoiceStatus(payment.invoice.id, newStatus, true, trx);

    // HF-SPRINT-F-08: notify Slack se refund > $100
    const refundAmount = dataNormalized.amountRefunded || 0;
    if (refundAmount >= 10000) {
      void SlackNotificationService.largeRefund(refundAmount, (data.currency || 'usd').toUpperCase(), payment.invoice.id);
    }
  }

  /**
   * HF-SPRINT-A-05: handlers de subscription lifecycle (fora de transaction
   * para não bloquear; service usa próprio save).
   * HF-SPRINT-F-08: notifica Slack em created/canceled.
   */
  private async handleSubscriptionEvent(data: any) {
    try {
      const updated = await StripeSubscriptionService.updateFromWebhook(data);
      // Notificações Slack para eventos comerciais
      if (updated && data?.status === 'active' && data?.metadata?.workeaser_plan_code) {
        // Detecta "criação ativa nova": Stripe envia subscription.updated com status active
        // após primeira invoice paid. Bom momento pra celebrar.
        const planCode = data.metadata.workeaser_plan_code as string;
        const amountCents = data.items?.data?.[0]?.price?.unit_amount || 0;
        const currency = (data.items?.data?.[0]?.price?.currency || 'usd').toUpperCase();
        void SlackNotificationService.newSubscription(planCode, currency, amountCents);
      }
      if (updated && (data?.status === 'canceled' || data?.cancel_at_period_end === true)) {
        const planCode = (data?.metadata?.workeaser_plan_code as string) || 'unknown';
        void SlackNotificationService.subscriptionCanceled(planCode, !!data?.cancel_at_period_end);
      }
    } catch (err) {
      Logger.error({ err, stripeSubId: data?.id }, 'handleSubscriptionEvent falhou');
    }
  }

  /**
   * Quando invoice.paid de uma subscription chega, marca subscription como `active`
   * (se estava past_due/unpaid). Stripe envia automaticamente `customer.subscription.updated`
   * antes, mas tratar aqui também é defesa em profundidade.
   */
  private async handleInvoicePaid(data: any) {
    const stripeSubId: string | undefined = data?.subscription;
    if (!stripeSubId) return; // invoice avulso, não de subscription
    try {
      // Re-sincroniza estado do stripe (mais confiável que tentar adivinhar do invoice)
      const Subscription = (await import('App/Models/Subscription')).default;
      const sub = await Subscription.query().where('stripe_subscription_id', stripeSubId).first();
      if (sub) {
        await StripeSubscriptionService.syncFromStripe(sub.id);
        Logger.info({ subId: sub.id, stripeSubId }, 'invoice.paid: subscription resincronizada');
      }
    } catch (err) {
      Logger.error({ err, stripeSubId }, 'handleInvoicePaid falhou');
    }
  }

  /**
   * Quando invoice.payment_failed, Stripe move subscription para `past_due` automaticamente.
   * Nossa tarefa: garantir que estado local reflita + (futuro) disparar notificação ao usuário.
   */
  private async handleInvoicePaymentFailed(data: any) {
    const stripeSubId: string | undefined = data?.subscription;
    if (!stripeSubId) return;
    try {
      const Subscription = (await import('App/Models/Subscription')).default;
      const sub = await Subscription.query().where('stripe_subscription_id', stripeSubId).first();
      if (sub) {
        await StripeSubscriptionService.syncFromStripe(sub.id);
        Logger.warn({ subId: sub.id, stripeSubId }, 'invoice.payment_failed: subscription marcada past_due');
        // HF-SPRINT-F-08: Slack alert
        const amount = data?.amount_due || 0;
        const currency = String(data?.currency || 'usd').toUpperCase();
        void SlackNotificationService.paymentFailed(sub.id, amount, currency);
      }
    } catch (err) {
      Logger.error({ err, stripeSubId }, 'handleInvoicePaymentFailed falhou');
    }
  }

  /**
   * Quando checkout.session.completed (flow PIX), liga a Subscription local "incomplete"
   * ao stripe_subscription_id real e marca como active.
   */
  private async handleCheckoutSessionCompleted(data: any) {
    try {
      const result = await StripeSubscriptionService.upgradeIncompleteFromCheckoutSession(data);
      if (result) {
        Logger.info({ subId: result.id, sessionId: data?.id }, 'checkout.session.completed: subscription ativada');
      }
    } catch (err) {
      Logger.error({ err, sessionId: data?.id }, 'handleCheckoutSessionCompleted falhou');
    }
  }

  private normalizeChargeEvent(event): ChargeInterface {
    return {
      gatewayId: event.id,
      status: event.refunded ? PaymentStatusEnum.REFUNDED : String(event.status).toUpperCase(),
      failureCode: event.failue_code,
      failureMessage: event.failue_message,
      sellerMessage: event.outcome ? event.outcome.seller_message : null,
      amountCaptured: event.amount_captured,
      amountRefunded: event.amount_refunded
    };
  }
}
