/**
 * ProcessEmailQueue — cron de 1 minuto que processa fila de email.
 * Sprint B (HF-SPRINT-B-09).
 *
 * Lê batch de até 20 emails pendentes/falhados (com `next_attempt_at <= NOW`),
 * envia via SES, atualiza status. Backoff exponencial entre tentativas.
 *
 * Para desabilitar: env DISABLE_EMAIL_QUEUE_WORKER=true
 */
import { BaseTask } from 'adonis5-scheduler/build';
import Logger from '@ioc:Adonis/Core/Logger';
import EmailQueueService from 'App/Services/EmailQueueService';

export default class ProcessEmailQueue extends BaseTask {
  public static get schedule() {
    return '* * * * *'; // a cada minuto
  }

  public static get useLock() {
    return true; // só 1 instância por vez
  }

  public async handle() {
    if ((process.env.DISABLE_EMAIL_QUEUE_WORKER || '').toLowerCase() === 'true') {
      return;
    }

    try {
      const result = await EmailQueueService.processBatch();
      if (result.sent > 0 || result.failed > 0) {
        Logger.info({ ...result }, 'ProcessEmailQueue batch');
      }
    } catch (err) {
      Logger.error({ err }, 'ProcessEmailQueue handle falhou');
    }
  }
}
