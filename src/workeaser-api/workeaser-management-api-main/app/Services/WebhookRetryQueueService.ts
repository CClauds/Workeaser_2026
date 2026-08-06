/**
 * WebhookRetryQueueService — fila durável de eventos webhook que falharam.
 * Sprint H (HF-SPRINT-H-09).
 *
 * Por que existe:
 *  Stripe re-envia webhook ~3 vezes com intervalo crescente até 3 dias.
 *  Se nosso handler falhar TODAS essas vezes (DB down longo, bug), evento se perde.
 *  Esta queue PERSISTE o payload no nosso DB, worker reprocessa indefinidamente
 *  (até 10 tentativas com backoff). Sob nosso controle, não do provider.
 *
 * Public API:
 *  - `enqueueFailedEvent(provider, eventType, eventId, payload, error)` — chamada do catch dos handlers
 *  - `processBatch()` — chamada do cron (5min); reinvoca handlers
 *
 * Handler dispatcher: rota por `provider` pro service correto (StripeService, etc.).
 * Pra simplificar, registra função handler nos próprios webhook controllers durante boot.
 */
import Logger from '@ioc:Adonis/Core/Logger';
import { DateTime } from 'luxon';
import WebhookDeadLetterItem from 'App/Models/WebhookDeadLetterItem';

type Handler = (payload: any, eventType: string) => Promise<void>;
const HANDLERS = new Map<string, Handler>();

const BATCH_SIZE = 10;
const BACKOFF_MIN: Record<number, number> = {
  1: 5, 2: 15, 3: 60, 4: 240, 5: 720, 6: 1440, 7: 2880, 8: 5760, 9: 11520, 10: 23040,
}; // minutos: 5min → 16 dias

class WebhookRetryQueueServiceClass {
  /**
   * Registra um handler para um provider. Chamado uma vez no boot pelo controller.
   * Ex: WebhookRetryQueueService.registerHandler('stripe', async (payload, eventType) => { ... })
   */
  public registerHandler(provider: string, handler: Handler) {
    HANDLERS.set(provider, handler);
  }

  /** Chama handler se registrado. Não swallow err — propaga. */
  public async runHandler(provider: string, payload: any, eventType: string): Promise<void> {
    const h = HANDLERS.get(provider);
    if (!h) throw new Error(`Nenhum handler registrado para provider=${provider}`);
    return h(payload, eventType);
  }

  /** Adiciona evento que falhou à fila pra retry futuro. */
  public async enqueueFailedEvent(
    provider: string,
    eventType: string,
    eventId: string | null,
    payload: any,
    error: unknown
  ): Promise<WebhookDeadLetterItem> {
    const errMsg = error instanceof Error ? error.message : String(error);
    return WebhookDeadLetterItem.create({
      provider,
      eventType,
      eventId,
      payload: JSON.stringify(payload).slice(0, 1024 * 200), // max 200KB
      status: 'pending',
      attempts: 0,
      maxAttempts: 10,
      nextAttemptAt: DateTime.now().plus({ minutes: BACKOFF_MIN[1] }),
      lastError: errMsg.slice(0, 480),
    });
  }

  /** Worker: pega batch de eventos pendentes vencidos e tenta reprocessar. */
  public async processBatch(): Promise<{ resolved: number; failed: number }> {
    const now = DateTime.now();
    const pending = await WebhookDeadLetterItem.query()
      .where('status', 'pending')
      .where((q) => {
        q.whereNull('next_attempt_at').orWhere('next_attempt_at', '<=', now.toJSDate());
      })
      .whereRaw('attempts < max_attempts')
      .orderBy('created_at', 'asc')
      .limit(BATCH_SIZE);

    if (pending.length === 0) return { resolved: 0, failed: 0 };

    let resolved = 0;
    let failed = 0;

    for (const item of pending) {
      item.status = 'processing';
      item.attempts += 1;
      await item.save();

      try {
        const payload = JSON.parse(item.payload);
        await this.runHandler(item.provider, payload, item.eventType);
        item.status = 'resolved';
        item.resolvedAt = DateTime.now();
        item.lastError = null;
        await item.save();
        resolved++;
        Logger.info(
          { id: item.id, provider: item.provider, eventType: item.eventType, attempts: item.attempts },
          'WebhookRetryQueue: resolved'
        );
      } catch (err: any) {
        item.lastError = String(err?.message || err).slice(0, 480);
        if (item.attempts >= item.maxAttempts) {
          item.status = 'failed';
          Logger.error(
            { id: item.id, provider: item.provider, attempts: item.attempts },
            'WebhookRetryQueue: failed (max attempts)'
          );
        } else {
          item.status = 'pending';
          const backoffMin = BACKOFF_MIN[item.attempts + 1] || 23040;
          item.nextAttemptAt = DateTime.now().plus({ minutes: backoffMin });
        }
        await item.save();
        failed++;
      }
    }

    return { resolved, failed };
  }
}

export const WebhookRetryQueueService = new WebhookRetryQueueServiceClass();

// HF-SPRINT-H-09: handler default Stripe — re-aplica subscription updates idempotentes
WebhookRetryQueueService.registerHandler('stripe', async (payload: any, eventType: string) => {
  const { default: StripeSubService } = await import('App/Services/Cowork/StripeSubscriptionService');
  if (
    eventType === 'customer.subscription.created' ||
    eventType === 'customer.subscription.updated' ||
    eventType === 'customer.subscription.deleted' ||
    eventType === 'customer.subscription.trial_will_end'
  ) {
    await StripeSubService.updateFromWebhook(payload);
    return;
  }
  if (eventType === 'checkout.session.completed') {
    await StripeSubService.upgradeIncompleteFromCheckoutSession(payload);
    return;
  }
  // Outros eventos (charge.succeeded etc.) raramente falham — não exigem retry custom
});

export default WebhookRetryQueueService;
