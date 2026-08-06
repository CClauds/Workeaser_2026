/**
 * SesController — recebe webhooks SNS para bounce/complaint do AWS SES.
 * Sprint C (HF-SPRINT-C-08, HF-SPRINT-C-09).
 *
 * Fluxo AWS recomendado:
 *   SES envia email → bounce/complaint chega → notifica SNS topic →
 *   SNS faz POST HTTP no nosso endpoint → atualizamos email_queue.status = 'bounced'
 *
 * 2 tipos de notificação:
 *   1. SubscriptionConfirmation — primeira vez, precisa GET na SubscribeURL
 *   2. Notification — eventos reais (Bounce, Complaint, Delivery)
 *
 * Bounces:
 *   - HARD (permanente, email não existe) → flag user pra parar de enviar
 *   - SOFT (caixa cheia, temporário) → re-enfileira em algumas horas
 *
 * Complaint: usuário marcou como spam → MUITO IMPORTANTE marcar como bounced
 * pra não impactar reputação do IP SES.
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Logger from '@ioc:Adonis/Core/Logger';
import axios from 'axios';
import { DateTime } from 'luxon';
import EmailQueueItem from 'App/Models/EmailQueueItem';
import User from 'App/Models/User';
// HF-SPRINT-F-08: Slack notifications
import SlackNotificationService from 'App/Services/SlackNotificationService';
// HF-SPRINT-G-02: anti-replay protection
import { isReplayed, registerNonce } from 'App/Utils/WebhookReplayProtection';
import { responseWithSuccess } from 'App/Utils/ResponseApi';

interface SnsMessage {
  Type?: string;
  Message?: string;
  SubscribeURL?: string;
  MessageId?: string;
  Topic?: string;
  TopicArn?: string;
}

export default class SesController {
  public async store({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    const messageType = (request.header('x-amz-sns-message-type') || '').toLowerCase();
    const body: SnsMessage = request.body() || {};

    // HF-SPRINT-G-02: anti-replay via SNS MessageId
    if (body.MessageId && isReplayed(body.MessageId)) {
      Logger.warn({ messageId: body.MessageId }, 'SES SNS webhook já processado (replay ignorado)');
      return responseWithSuccess(response, { ok: true, type: 'replay_ignored' });
    }

    try {
      // 1. SubscriptionConfirmation — Amazon mandando handshake
      if (messageType === 'subscriptionconfirmation' || body.Type === 'SubscriptionConfirmation') {
        if (body.SubscribeURL) {
          try {
            await axios.get(body.SubscribeURL, { timeout: 10_000 });
            Logger.info({ topic: body.TopicArn }, 'SES SNS subscription confirmed');
          } catch (err) {
            Logger.error({ err }, 'SES SNS confirmation GET falhou');
          }
        }
        return responseWithSuccess(response, { ok: true, type: 'subscription_confirmed' });
      }

      // 2. Notification real
      if (messageType === 'notification' || body.Type === 'Notification') {
        const innerStr = body.Message;
        if (!innerStr) return responseWithSuccess(response, { ok: true, type: 'noop' });
        let inner: any = {};
        try {
          inner = typeof innerStr === 'string' ? JSON.parse(innerStr) : innerStr;
        } catch {
          inner = { raw: innerStr };
        }
        const notificationType: string = inner.notificationType || inner.eventType || 'unknown';
        const mailObj = inner.mail || {};

        if (notificationType === 'Bounce') {
          await this.handleBounce(inner.bounce, mailObj);
        } else if (notificationType === 'Complaint') {
          await this.handleComplaint(inner.complaint, mailObj);
        } else if (notificationType === 'Delivery') {
          // Opcional: registrar success de entrega no email_queue
          await this.handleDelivery(inner.delivery, mailObj);
        }
      }

      // HF-SPRINT-G-02: registra nonce APÓS processamento OK
      if (body.MessageId) registerNonce(body.MessageId);
      return responseWithSuccess(response, { ok: true });
    } catch (err) {
      Logger.error({ err }, 'SES SNS webhook error');
      // Devolve 200 (não dependemos de retry da AWS pra processar evento)
      return responseWithSuccess(response, { ok: true });
    }
  }

  private async handleBounce(bounce: any, mailObj: any) {
    const recipients: string[] = (bounce?.bouncedRecipients || []).map((r: any) => r?.emailAddress).filter(Boolean);
    const bounceType: string = bounce?.bounceType || 'Unknown'; // Permanent | Transient | Undetermined
    const isHard = bounceType === 'Permanent';

    // Mapeia para email_queue por providerMessageId (SES SES-Message-Id) OU por to_email
    const sesMessageId: string | undefined = mailObj?.messageId;
    for (const recipient of recipients) {
      const items = await EmailQueueItem.query()
        .where('to_email', recipient)
        .where((q) => {
          if (sesMessageId) q.orWhere('provider_message_id', sesMessageId);
        })
        .orderBy('created_at', 'desc')
        .limit(5);

      for (const item of items) {
        item.status = 'bounced';
        item.lastError = `Bounce: ${bounceType}${isHard ? ' (permanent — não enviar mais)' : ' (transient — pode re-tentar)'}`;
        await item.save();
      }
      Logger.warn({ recipient, bounceType, sesMessageId }, isHard ? 'SES HARD bounce' : 'SES soft bounce');

      // HF-SPRINT-D-04: marcar user.email_bouncing=true em bounce HARD permanente
      // (Transient = soft, não bloqueamos — pode ser caixa cheia temporária)
      if (isHard) {
        try {
          const user = await User.findBy('email', recipient);
          if (user) {
            user.emailBouncing = true;
            user.emailBouncingAt = DateTime.now();
            user.emailBouncingReason = `HARD bounce (${bounceType})`.slice(0, 120);
            await user.save();
            Logger.warn({ userId: user.id, email: recipient }, 'User marcado email_bouncing=true');
          }
        } catch (err) {
          Logger.error({ err, recipient }, 'Falha marcando user.email_bouncing');
        }
      }
    }
  }

  private async handleComplaint(complaint: any, mailObj: any) {
    const recipients: string[] = (complaint?.complainedRecipients || []).map((r: any) => r?.emailAddress).filter(Boolean);
    const sesMessageId: string | undefined = mailObj?.messageId;
    for (const recipient of recipients) {
      const items = await EmailQueueItem.query()
        .where('to_email', recipient)
        .where((q) => {
          if (sesMessageId) q.orWhere('provider_message_id', sesMessageId);
        })
        .orderBy('created_at', 'desc')
        .limit(5);

      for (const item of items) {
        item.status = 'bounced';
        item.lastError = 'Complaint (spam) — USER OPTED OUT';
        await item.save();
      }
      Logger.error(
        { recipient, sesMessageId },
        'SES Complaint — usuário marcou como spam. PARAR de enviar pra este email.'
      );
      // HF-SPRINT-F-08: complaint é SEMPRE crítico — notify Slack
      void SlackNotificationService.bounceComplaintSpike(1, `complaint de ${recipient}`);

      // HF-SPRINT-D-04: marcar user.email_complaint=true PERMANENTEMENTE
      // Complaint é decisão do usuário (clicou "marcar como spam") — NUNCA mais enviar.
      try {
        const user = await User.findBy('email', recipient);
        if (user) {
          user.emailComplaint = true;
          user.emailBouncing = true; // também
          user.emailBouncingAt = DateTime.now();
          user.emailBouncingReason = 'Complaint (user marked as spam)';
          await user.save();
          Logger.error({ userId: user.id, email: recipient }, 'User marcado email_complaint=true PERMANENTE');
        }
      } catch (err) {
        Logger.error({ err, recipient }, 'Falha marcando user.email_complaint');
      }
    }
  }

  private async handleDelivery(delivery: any, mailObj: any) {
    const recipients: string[] = delivery?.recipients || [];
    const sesMessageId: string | undefined = mailObj?.messageId;
    if (!sesMessageId) return;
    // Atualiza items 'sent' que correspondem ao messageId pra 'delivered' (não temos coluna ainda,
    // mantém 'sent' mas atualiza provider_message_id pra match real)
    Logger.debug({ recipients, sesMessageId }, 'SES delivery confirmation');
  }
}
