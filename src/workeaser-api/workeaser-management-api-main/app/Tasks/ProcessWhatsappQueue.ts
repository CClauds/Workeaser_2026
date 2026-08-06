/**
 * ProcessWhatsappQueue — cron de 1 minuto que envia WhatsApp pendentes.
 * Sprint C (HF-SPRINT-C-04).
 */
import { BaseTask } from 'adonis5-scheduler/build';
import Logger from '@ioc:Adonis/Core/Logger';
import WhatsappService from 'App/Services/WhatsappService';

export default class ProcessWhatsappQueue extends BaseTask {
  public static get schedule() {
    return '* * * * *';
  }

  public static get useLock() {
    return true;
  }

  public async handle() {
    if ((process.env.DISABLE_WHATSAPP_WORKER || '').toLowerCase() === 'true') {
      return;
    }
    if (!process.env.WHATSAPP_META_ACCESS_TOKEN) {
      // sem credencial = noop silencioso (não acumula erros em logs)
      return;
    }
    try {
      const result = await WhatsappService.processBatch();
      if (result.sent > 0 || result.failed > 0) {
        Logger.info({ ...result }, 'ProcessWhatsappQueue batch');
      }
    } catch (err) {
      Logger.error({ err }, 'ProcessWhatsappQueue falhou');
    }
  }
}
