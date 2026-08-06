/**
 * PlaidReconciliation — cron de 2h em 2h pra match automático transação→invoice.
 * Sprint C (HF-SPRINT-C-07).
 */
import { BaseTask } from 'adonis5-scheduler/build';
import Logger from '@ioc:Adonis/Core/Logger';
import PlaidReconciliationService from 'App/Services/Cowork/PlaidReconciliationService';

export default class PlaidReconciliation extends BaseTask {
  public static get schedule() {
    return '0 */2 * * *'; // a cada 2h
  }

  public static get useLock() {
    return true;
  }

  public async handle() {
    if ((process.env.DISABLE_PLAID_RECONCILIATION || '').toLowerCase() === 'true') {
      return;
    }
    try {
      const result = await PlaidReconciliationService.reconcileAll(48);
      Logger.info({ ...result }, 'PlaidReconciliation: ciclo concluído');
    } catch (err) {
      Logger.error({ err }, 'PlaidReconciliation: falhou');
    }
  }
}
