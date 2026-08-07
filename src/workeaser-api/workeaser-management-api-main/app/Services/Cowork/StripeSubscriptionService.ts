/**
 * StripeSubscriptionService — cobrança recorrente via Stripe Subscriptions.
 * Sprint A (HF-SPRINT-A-04).
 *
 * Responsabilidades:
 *  - Criar Stripe Customer (1 vez por user) e armazenar em users.stripe_customer_id
 *  - Criar Stripe Subscription com payment_method (card OU PIX via setup intent)
 *  - Cancelar subscription (cancel at period end ou imediato)
 *  - Sincronizar estado local quando webhook chega
 *
 * Não substitui o flow de invoice one-time existente — é caminho paralelo.
 * Cobrança recorrente: Stripe gera invoice automaticamente todo período;
 * webhook `invoice.paid` confirma; webhook `customer.subscription.updated`
 * espelha estado.
 *
 * PIX: Stripe Brasil suporta PIX como payment_method em checkout sessions.
 * Para subscriptions diretas com PIX, o cliente precisa autorizar 1 setup
 * intent OFFLINE (cliente paga primeiro QR, depois cobranças seguintes usam
 * o mandate). Stripe ainda está rolando isso por região — fallback: cartão.
 */
import Env from '@ioc:Adonis/Core/Env';
import Logger from '@ioc:Adonis/Core/Logger';
import Stripe from 'stripe';
import { DateTime } from 'luxon';
import AppError from 'App/Utils/AppError';
import User from 'App/Models/User';
import Subscription, { SubscriptionStatus } from 'App/Models/Subscription';
import SubscriptionPlan from 'App/Models/SubscriptionPlan';
// HF-SPRINT-I-02: discount integration
import DiscountCode from 'App/Models/DiscountCode';
import DiscountCodeService from 'App/Services/DiscountCodeService';

export interface CreateSubscriptionRequest {
  userId: number;
  planId: number;
  /** payment method id retornado pelo Stripe Elements no frontend (card) */
  paymentMethodId?: string;
  /** indica que pagamento vai por PIX (Brasil) — Stripe usa checkout session com qr_code */
  usePix?: boolean;
  /** opcional: trial em dias (override do plan.features.trial_days) */
  trialDays?: number;
  /** HF-SPRINT-I-02: cupom de desconto opcional */
  discountCode?: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: number;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  /** se PIX foi usado, URL do checkout / QR code */
  checkoutUrl?: string;
  /** se card foi usado e exigiu 3DS, client_secret pra finalizar no frontend */
  clientSecret?: string;
  /** HF-SPRINT-I-02: info de desconto aplicado */
  discount?: {
    code: string;
    discount_cents: number;
    final_price_cents: number;
  };
}

class StripeSubscriptionServiceClass {
  private getStripe(): Stripe {
    const key = Env.get('STRIPE_SECRET_KEY') as string | undefined;
    if (!key) {
      throw new AppError(AppError.LOGIC_ERROR, 'Stripe não configurado (STRIPE_SECRET_KEY ausente)');
    }
    // Versão fixada para previsibilidade. Suporta PIX no Brasil (a partir de 2022-11-15).
    return new Stripe(key, { apiVersion: '2023-10-16' as Stripe.LatestApiVersion });
  }

  /** Cria Stripe Customer se ainda não existe e grava em users.stripe_customer_id */
  private async ensureStripeCustomer(user: User): Promise<string> {
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const stripe = this.getStripe();
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      metadata: { workeaser_user_id: String(user.id) },
    });

    user.stripeCustomerId = customer.id;
    await user.save();
    return customer.id;
  }

  /**
   * HF-SPRINT-I-02: garante que existe Stripe Coupon correspondente ao DiscountCode local.
   * Se `stripe_coupon_id` já está setado, devolve.
   * Senão, cria coupon novo no Stripe (duration='once', valor convertido) e persiste o id.
   * Retorna stripe_coupon_id (cou_xxx).
   */
  private async ensureStripeCoupon(dc: DiscountCode): Promise<string> {
    if (dc.stripeCouponId) return dc.stripeCouponId;
    const stripe = this.getStripe();
    try {
      const createParams: Stripe.CouponCreateParams = {
        duration: 'once', // aplica só na primeira invoice — pra recurring usar 'forever' ou 'repeating'
        metadata: {
          workeaser_discount_code_id: String(dc.id),
          workeaser_code: dc.code,
        },
      };
      if (dc.discountType === 'percent') {
        createParams.percent_off = dc.discountValue;
      } else {
        // fixed: discountValue é cents
        createParams.amount_off = dc.discountValue;
        createParams.currency = (dc.currency || 'usd').toLowerCase();
      }
      const coupon = await stripe.coupons.create(createParams);
      dc.stripeCouponId = coupon.id;
      await dc.save();
      Logger.info({ couponId: coupon.id, codeId: dc.id }, 'Stripe coupon criado pra DiscountCode');
      return coupon.id;
    } catch (err: any) {
      Logger.error({ err, codeId: dc.id }, 'Falha ao criar Stripe coupon');
      throw new AppError(
        AppError.LOGIC_ERROR,
        `Não foi possível registrar cupom no Stripe: ${err.message}`
      );
    }
  }

  /** Cria uma nova assinatura para um usuário. */
  public async create(req: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const user = await User.find(req.userId);
    if (!user) throw new AppError(AppError.NOT_FOUND, 'Usuário não encontrado');

    const plan = await SubscriptionPlan.find(req.planId);
    if (!plan || !plan.active) throw new AppError(AppError.NOT_FOUND, 'Plano inválido ou inativo');
    if (!plan.stripePriceId) {
      throw new AppError(
        AppError.LOGIC_ERROR,
        'Plano não tem stripe_price_id configurado. Configure no painel Stripe primeiro.'
      );
    }

    const stripe = this.getStripe();
    const customerId = await this.ensureStripeCustomer(user);

    // HF-SPRINT-I-02: validar discount code se fornecido
    let validatedDiscount: {
      dc: DiscountCode;
      discountCents: number;
      finalPriceCents: number;
      stripeCouponId: string;
    } | null = null;
    if (req.discountCode) {
      const validation = await DiscountCodeService.validate(
        req.discountCode,
        req.userId,
        req.planId,
        plan.amountCents
      );
      if (!validation.valid || !validation.code) {
        throw new AppError(
          AppError.VALIDATION_FAIL,
          `Cupom inválido: ${validation.reason || 'razão desconhecida'}`
        );
      }
      // Garante coupon Stripe correspondente
      const stripeCouponId = await this.ensureStripeCoupon(validation.code);
      validatedDiscount = {
        dc: validation.code,
        discountCents: validation.discount_cents || 0,
        finalPriceCents: validation.final_price_cents || plan.amountCents,
        stripeCouponId,
      };
    }

    // Anexar payment method ao customer (se cartão)
    if (req.paymentMethodId && !req.usePix) {
      try {
        await stripe.paymentMethods.attach(req.paymentMethodId, { customer: customerId });
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: req.paymentMethodId },
        });
      } catch (err) {
        Logger.warn({ err }, 'Falha ao anexar payment method ao customer Stripe');
        throw new AppError(AppError.VALIDATION_FAIL, `Falha no método de pagamento: ${err.message}`);
      }
    }

    // PIX: usa Checkout Session (Stripe gera link com QR, cliente paga, retorna pra app)
    if (req.usePix) {
      try {
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          mode: 'subscription',
          customer: customerId,
          line_items: [{ price: plan.stripePriceId, quantity: 1 }],
          payment_method_types: ['card', 'pix'] as any,
          locale: 'pt-BR',
          success_url: `${Env.get('APP_URL', 'http://localhost:3000')}/settings/subscriptions?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${Env.get('APP_URL', 'http://localhost:3000')}/settings/subscriptions?canceled=1`,
          metadata: {
            workeaser_user_id: String(user.id),
            workeaser_plan_code: plan.code,
            workeaser_discount_code: validatedDiscount?.dc.code || '',
          },
          subscription_data: {
            trial_period_days: req.trialDays,
            metadata: {
              workeaser_user_id: String(user.id),
              workeaser_plan_code: plan.code,
              workeaser_discount_code: validatedDiscount?.dc.code || '',
            },
          },
        };

        // HF-SPRINT-I-03: passar coupon no checkout se houver discount
        if (validatedDiscount) {
          (sessionParams as any).discounts = [{ coupon: validatedDiscount.stripeCouponId }];
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        // Cria subscription local em estado "incomplete" até webhook confirmar
        const local = await Subscription.create({
          subscriptionPlanId: plan.id,
          userId: user.id,
          stripeCustomerId: customerId,
          status: 'incomplete',
          metadata: {
            checkout_session_id: session.id,
            payment_methods: ['card', 'pix'],
            // HF-SPRINT-I-05: marca cupom pendente — apply real acontece quando session completar via webhook
            pending_discount_code_id: validatedDiscount?.dc.id || null,
            pending_discount_amount_off_cents: validatedDiscount?.discountCents || 0,
            pending_discount_currency: plan.currency,
          },
        });

        return {
          subscriptionId: local.id,
          stripeSubscriptionId: '',
          status: 'incomplete',
          checkoutUrl: session.url || undefined,
          discount: validatedDiscount
            ? {
                code: validatedDiscount.dc.code,
                discount_cents: validatedDiscount.discountCents,
                final_price_cents: validatedDiscount.finalPriceCents,
              }
            : undefined,
        };
      } catch (err) {
        Logger.error({ err }, 'Stripe checkout session (PIX) falhou');
        throw new AppError(AppError.LOGIC_ERROR, `Stripe error: ${err.message}`);
      }
    }

    // Card flow — criar subscription direto
    try {
      const subParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: plan.stripePriceId }],
        default_payment_method: req.paymentMethodId,
        trial_period_days: req.trialDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          workeaser_user_id: String(user.id),
          workeaser_plan_code: plan.code,
          workeaser_discount_code: validatedDiscount?.dc.code || '',
        },
      };
      // HF-SPRINT-I-03: aplica coupon no Stripe se discount validado
      if (validatedDiscount) {
        subParams.coupon = validatedDiscount.stripeCouponId;
      }
      const stripeSub = await stripe.subscriptions.create(subParams);

      const local = await Subscription.create({
        subscriptionPlanId: plan.id,
        userId: user.id,
        stripeSubscriptionId: stripeSub.id,
        stripeCustomerId: customerId,
        status: this.mapStripeStatus(stripeSub.status),
        currentPeriodStart: DateTime.fromSeconds(stripeSub.current_period_start),
        currentPeriodEnd: DateTime.fromSeconds(stripeSub.current_period_end),
        trialEnd: stripeSub.trial_end ? DateTime.fromSeconds(stripeSub.trial_end) : null,
        metadata: { provider: 'stripe' },
      });

      // HF-SPRINT-I-05: registra redemption ATOMICA (incrementa counter + cria row)
      // Card flow: Stripe já aplicou coupon imediatamente — confirmar aplicação local.
      if (validatedDiscount) {
        try {
          await DiscountCodeService.apply(
            validatedDiscount.dc.id,
            user.id,
            local.id,
            plan.currency,
            validatedDiscount.discountCents
          );
        } catch (applyErr) {
          // Discount já foi cobrado no Stripe — não dá pra "desfazer".
          // Log + segue. Atacante consegue ganhar 1 desconto extra além do limit-per-user
          // só se a aplicação local falhar APÓS Stripe aceitar (rara janela).
          Logger.error({ applyErr, codeId: validatedDiscount.dc.id, userId: user.id, subId: local.id },
            'DiscountCodeService.apply falhou pós-create (race window — investigar)');
        }
      }

      const latestInvoice = stripeSub.latest_invoice as Stripe.Invoice | null;
      const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent | null;
      const clientSecret = paymentIntent?.client_secret || undefined;

      return {
        subscriptionId: local.id,
        stripeSubscriptionId: stripeSub.id,
        status: local.status,
        clientSecret,
        discount: validatedDiscount
          ? {
              code: validatedDiscount.dc.code,
              discount_cents: validatedDiscount.discountCents,
              final_price_cents: validatedDiscount.finalPriceCents,
            }
          : undefined,
      };
    } catch (err) {
      Logger.error({ err }, 'Stripe subscription create falhou');
      throw new AppError(AppError.LOGIC_ERROR, `Stripe error: ${err.message}`);
    }
  }

  /**
   * Cancela uma subscription.
   * @param atPeriodEnd se true (default), cancela ao fim do período pago.
   *                    se false, cancela imediatamente (sem reembolso proporcional).
   */
  public async cancel(localSubscriptionId: number, atPeriodEnd = true): Promise<void> {
    const sub = await Subscription.find(localSubscriptionId);
    if (!sub) throw new AppError(AppError.NOT_FOUND, 'Assinatura não encontrada');
    if (!sub.stripeSubscriptionId) {
      // Subscription incomplete (PIX checkout não confirmado): só marca local como canceled
      sub.status = 'canceled';
      sub.canceledAt = DateTime.now();
      await sub.save();
      return;
    }

    const stripe = this.getStripe();
    try {
      if (atPeriodEnd) {
        const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        sub.cancelAt = updated.cancel_at ? DateTime.fromSeconds(updated.cancel_at) : null;
      } else {
        const canceled = await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
        sub.status = this.mapStripeStatus(canceled.status);
        sub.canceledAt = DateTime.now();
      }
      await sub.save();
    } catch (err) {
      Logger.error({ err }, 'Stripe cancel falhou');
      throw new AppError(AppError.LOGIC_ERROR, `Stripe error: ${err.message}`);
    }
  }

  /** Re-sincroniza estado local pulling do Stripe (útil pra recuperação após queda do webhook). */
  public async syncFromStripe(localSubscriptionId: number): Promise<Subscription> {
    const sub = await Subscription.find(localSubscriptionId);
    if (!sub) throw new AppError(AppError.NOT_FOUND, 'Assinatura não encontrada');
    if (!sub.stripeSubscriptionId) return sub;

    const stripe = this.getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    return this.applyStripeData(sub, stripeSub);
  }

  /**
   * Atualiza subscription local a partir de payload de webhook.
   * Chamado pelo StripeController quando evento `customer.subscription.*` chega.
   */
  public async updateFromWebhook(stripeData: any): Promise<Subscription | null> {
    if (!stripeData?.id) return null;
    const sub = await Subscription.query().where('stripe_subscription_id', stripeData.id).first();
    if (!sub) {
      Logger.warn({ stripeSubId: stripeData.id }, 'Webhook subscription para subscription local inexistente');
      return null;
    }
    return this.applyStripeData(sub, stripeData);
  }

  /**
   * Cria subscription local a partir de checkout session completado (PIX flow).
   * HF-SPRINT-I-05: aplica discount redemption pendente se houver.
   */
  public async upgradeIncompleteFromCheckoutSession(stripeSession: any): Promise<Subscription | null> {
    const sessionId: string | undefined = stripeSession?.id;
    if (!sessionId) return null;
    const sub = await Subscription.query()
      .whereJsonSuperset('metadata', { checkout_session_id: sessionId })
      .first();
    if (!sub) {
      Logger.warn({ sessionId }, 'Checkout session sem subscription local correspondente');
      return null;
    }
    if (stripeSession.subscription) {
      sub.stripeSubscriptionId = stripeSession.subscription as string;
    }
    sub.status = 'active'; // checkout finalizado com sucesso

    // HF-SPRINT-I-05: aplicar discount pendente (PIX flow — registramos no metadata em create)
    const meta = (sub.metadata as Record<string, any>) || {};
    const pendingCodeId: number | null = meta.pending_discount_code_id || null;
    const pendingAmountOff: number = meta.pending_discount_amount_off_cents || 0;
    const pendingCurrency: string = meta.pending_discount_currency || 'usd';
    if (pendingCodeId && sub.userId) {
      try {
        await DiscountCodeService.apply(
          pendingCodeId,
          sub.userId,
          sub.id,
          pendingCurrency,
          pendingAmountOff
        );
        // Limpa pending pra não duplicar em retry de webhook
        delete meta.pending_discount_code_id;
        delete meta.pending_discount_amount_off_cents;
        delete meta.pending_discount_currency;
        sub.metadata = meta;
        Logger.info({ subId: sub.id, codeId: pendingCodeId }, 'Discount aplicado pós-PIX checkout');
      } catch (err) {
        Logger.error({ err, subId: sub.id, codeId: pendingCodeId }, 'Falha ao aplicar discount pós-PIX');
        // Não bloqueia ativação da subscription
      }
    }

    await sub.save();
    return sub;
  }

  /** Aplica payload Stripe Subscription ao registro local. */
  private async applyStripeData(sub: Subscription, stripeData: any): Promise<Subscription> {
    sub.status = this.mapStripeStatus(stripeData.status);
    sub.currentPeriodStart = stripeData.current_period_start
      ? DateTime.fromSeconds(stripeData.current_period_start)
      : sub.currentPeriodStart;
    sub.currentPeriodEnd = stripeData.current_period_end
      ? DateTime.fromSeconds(stripeData.current_period_end)
      : sub.currentPeriodEnd;
    sub.cancelAt = stripeData.cancel_at ? DateTime.fromSeconds(stripeData.cancel_at) : null;
    sub.canceledAt = stripeData.canceled_at ? DateTime.fromSeconds(stripeData.canceled_at) : null;
    sub.trialEnd = stripeData.trial_end ? DateTime.fromSeconds(stripeData.trial_end) : null;
    await sub.save();
    return sub;
  }

  private mapStripeStatus(s: string): SubscriptionStatus {
    const allowed: SubscriptionStatus[] = [
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
    ];
    return (allowed.includes(s as SubscriptionStatus) ? s : 'incomplete') as SubscriptionStatus;
  }

  /** Lista subscriptions de um usuário com plan preloaded. */
  public async listForUser(userId: number): Promise<Subscription[]> {
    return Subscription.query()
      .where('user_id', userId)
      .preload('plan')
      .orderBy('created_at', 'desc');
  }

  /**
   * HF-SPRINT-F-01: Customer Portal Stripe.
   * Devolve URL pra Stripe Billing Portal — cliente gerencia payment methods,
   * baixa invoices, cancela subscription, sozinho. Reduz volume de suporte.
   *
   * Pré-req: ativar 1x no painel Stripe → Settings → Billing → Customer portal.
   */
  public async createPortalSession(userId: number, returnUrl: string): Promise<{ url: string }> {
    const user = await User.find(userId);
    if (!user) throw new AppError(AppError.NOT_FOUND, 'Usuário não encontrado');
    if (!user.stripeCustomerId) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'Customer Portal só disponível após primeira assinatura. Crie uma subscription antes.'
      );
    }
    const stripe = this.getStripe();
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
      });
      return { url: session.url };
    } catch (err: any) {
      Logger.error({ err, userId }, 'Stripe billingPortal.sessions.create falhou');
      if (err?.message?.includes('configuration')) {
        throw new AppError(
          AppError.LOGIC_ERROR,
          'Customer Portal não configurado no Stripe Dashboard. Settings → Billing → Customer portal → Activate.'
        );
      }
      throw new AppError(AppError.LOGIC_ERROR, `Stripe error: ${err.message}`);
    }
  }

  /**
   * HF-SPRINT-G-04: estender período de trial.
   * Útil pra admin dar benefício a cliente em risco de churn.
   *
   * @param newTrialEndUnix unix timestamp em segundos (FUTURO). Use 'now' pra encerrar imediato.
   */
  public async extendTrial(
    localSubscriptionId: number,
    newTrialEndUnix: number | 'now'
  ): Promise<Subscription> {
    const sub = await Subscription.find(localSubscriptionId);
    if (!sub) throw new AppError(AppError.NOT_FOUND, 'Assinatura não encontrada');
    if (!sub.stripeSubscriptionId) {
      throw new AppError(AppError.VALIDATION_FAIL, 'Subscription não ativada no Stripe.');
    }
    if (newTrialEndUnix !== 'now') {
      const nowUnix = Math.floor(Date.now() / 1000);
      if (newTrialEndUnix <= nowUnix) {
        throw new AppError(AppError.VALIDATION_FAIL, 'newTrialEndUnix deve ser no futuro');
      }
      if (newTrialEndUnix > nowUnix + 730 * 86400) {
        throw new AppError(AppError.VALIDATION_FAIL, 'Trial máximo 730 dias (Stripe limit)');
      }
    }
    const stripe = this.getStripe();
    try {
      const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        trial_end: newTrialEndUnix,
        proration_behavior: 'none',
      });
      sub.status = this.mapStripeStatus(updated.status);
      sub.trialEnd = updated.trial_end ? DateTime.fromSeconds(updated.trial_end) : null;
      sub.currentPeriodEnd = updated.current_period_end
        ? DateTime.fromSeconds(updated.current_period_end)
        : sub.currentPeriodEnd;
      await sub.save();
      return sub;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      Logger.error({ err, subId: localSubscriptionId }, 'extendTrial falhou');
      throw new AppError(AppError.LOGIC_ERROR, `Stripe error: ${err.message}`);
    }
  }

  /**
   * HF-SPRINT-F-04: mudar plano de uma subscription existente com proration automático.
   *
   * `prorationBehavior`:
   *  - 'create_prorations' (default): credita não-utilizado + cobra novo proporcional
   *  - 'none': troca sem proration (valor cheio na próxima invoice)
   *  - 'always_invoice': invoice imediata pelo proration
   */
  public async changePlan(
    localSubscriptionId: number,
    newPlanId: number,
    prorationBehavior: 'create_prorations' | 'none' | 'always_invoice' = 'create_prorations'
  ): Promise<Subscription> {
    const sub = await Subscription.find(localSubscriptionId);
    if (!sub) throw new AppError(AppError.NOT_FOUND, 'Assinatura não encontrada');
    if (!sub.stripeSubscriptionId) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'Assinatura ainda não foi ativada no Stripe (PIX pendente?). Aguarde confirmação.'
      );
    }
    const newPlan = await SubscriptionPlan.find(newPlanId);
    if (!newPlan || !newPlan.active) {
      throw new AppError(AppError.NOT_FOUND, 'Novo plano inválido ou inativo');
    }
    if (!newPlan.stripePriceId) {
      throw new AppError(
        AppError.LOGIC_ERROR,
        'Novo plano não tem stripe_price_id configurado.'
      );
    }
    if (sub.subscriptionPlanId === newPlanId) {
      throw new AppError(AppError.VALIDATION_FAIL, 'Já está nesse plano.');
    }

    const stripe = this.getStripe();
    try {
      const existing = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
      const currentItemId = existing.items?.data?.[0]?.id;
      if (!currentItemId) {
        throw new AppError(AppError.LOGIC_ERROR, 'Subscription Stripe sem item — estado inconsistente');
      }
      const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        items: [{ id: currentItemId, price: newPlan.stripePriceId }],
        proration_behavior: prorationBehavior,
        cancel_at_period_end: false, // reset se estava marcada
      });

      sub.subscriptionPlanId = newPlanId;
      sub.status = this.mapStripeStatus(updated.status);
      sub.currentPeriodStart = DateTime.fromSeconds(updated.current_period_start);
      sub.currentPeriodEnd = DateTime.fromSeconds(updated.current_period_end);
      sub.cancelAt = null;
      await sub.save();
      return sub;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      Logger.error({ err, subId: localSubscriptionId, newPlanId }, 'Stripe changePlan falhou');
      throw new AppError(AppError.LOGIC_ERROR, `Stripe error: ${err.message}`);
    }
  }
}

export const StripeSubscriptionService = new StripeSubscriptionServiceClass();
export default StripeSubscriptionService;
