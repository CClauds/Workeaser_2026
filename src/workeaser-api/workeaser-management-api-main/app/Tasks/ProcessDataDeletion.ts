/**
 * ProcessDataDeletion — cron diário que processa pedidos LGPD vencidos.
 * Sprint B (HF-SPRINT-B-04).
 *
 * Roda às 3h. Pega todos pedidos `status=requested` com `scheduled_execution_at <= NOW`
 * e processa um por vez. Cada um é independente (uma falha não bloqueia os outros).
 */
import { BaseTask } from 'adonis5-scheduler/build';
import { DateTime } from 'luxon';
import Logger from '@ioc:Adonis/Core/Logger';
import DataDeletionRequest from 'App/Models/DataDeletionRequest';
import DataDeletionService from 'App/Services/DataDeletionService';

export default class ProcessDataDeletion extends BaseTask {
  public static get schedule() {
    return '0 3 * * *'; // todo dia 3h
  }

  public static get useLock() {
    return true; // só 1 instância por vez
  }

  public async handle() {
    if ((process.env.DISABLE_LGPD_DELETION_TASK || '').toLowerCase() === 'true') {
      return;
    }

    const pending = await DataDeletionRequest.query()
      .where('status', 'requested')
      .where('scheduled_execution_at', '<=', DateTime.now().toJSDate())
      .orderBy('scheduled_execution_at', 'asc')
      .limit(50);

    if (pending.length === 0) {
      Logger.info('ProcessDataDeletion: nenhum pedido vencido');
      return;
    }

    Logger.info(`ProcessDataDeletion: ${pending.length} pedidos a processar`);

    let success = 0;
    let failed = 0;
    for (const req of pending) {
      try {
        await DataDeletionService.process(req.id);
        success++;
      } catch (err) {
        Logger.error({ err, requestId: req.id }, 'ProcessDataDeletion: pedido falhou');
        failed++;
      }
    }

    Logger.info({ success, failed }, 'ProcessDataDeletion: lote processado');
  }
}
