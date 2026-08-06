/**
 * ProcessWebhookRetryQueue — cron 5min que tenta reprocessar webhooks falhados.
 * Sprint H (HF-SPRINT-H-10).
 *
 * Para desabilitar: DISABLE_WEBHOOK_RETRY_QUEUE=true
 */
import { BaseTask } from 'adonis5-scheduler/build';
import Logger from '@ioc:Adonis/Core/Logger';
import WebhookRetryQueueService from 'App/Services/WebhookRetryQueueService';

export default class ProcessWebhookRetryQueue extends BaseTask {
  public static get schedule() {
    return '*/5 * * * *'; // a cada 5 minutos
  }

  public static get useLock() {
    return true;
  }

  public async handle() {
    if ((process.env.DISABLE_WEBHOOK_RETRY_QUEUE || '').toLowerCase() === 'true') {
      return;
    }
    try {
      const result = await WebhookRetryQueueService.processBatch();
      if (result.resolved > 0 || result.failed > 0) {
        Logger.info({ ...result }, 'ProcessWebhookRetryQueue batch');
      }
    } catch (err) {
      Logger.error({ err }, 'ProcessWebhookRetryQueue falhou');
    }
  }
}
