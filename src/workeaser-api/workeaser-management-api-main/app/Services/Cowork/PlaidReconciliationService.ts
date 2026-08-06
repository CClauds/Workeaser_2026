/**
 * PlaidReconciliationService — match automático de transações bancárias com invoices.
 * Sprint C (HF-SPRINT-C-06).
 *
 * Quando o cowork conecta conta bancária via Plaid e cliente paga (por TED, boleto,
 * Pix BR via conta), a transação aparece no banco. Esta service tenta casar
 * automaticamente com uma invoice em aberto.
 *
 * Heurísticas de match (em ordem de precisão):
 *   1. Match exato por valor + janela de ±3 dias do vencimento + invoice em aberto
 *   2. Match por valor + reference (descrição da transação contém invoice_number)
 *   3. Match por valor único no período (se houver só 1 invoice com aquele valor exato
 *      no período do cowork, é provavelmente ela)
 *
 * Conservador por design: se houver ambiguidade, NÃO reconcilia (deixa pra revisão manual).
 * Confiança numa false-positive de cobrança é mais alta que valor de pequenas otimizações.
 */
import Logger from '@ioc:Adonis/Core/Logger';
import { DateTime } from 'luxon';
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database';
import LinkedBankAccount from 'App/Models/LinkedBankAccount';
import BankAccountTransaction from 'App/Models/BankAccountTransaction';
import Invoice from 'App/Models/Invoice';
import PaymentHistory from 'App/Models/PaymentHistory';
import { InvoiceStatusEnum, PaymentStatusEnum } from 'Contracts/enums';

const MATCH_WINDOW_DAYS = 3;

export interface ReconciliationResult {
  scanned: number;
  matched: number;
  ambiguous: number; // skipped pra revisão manual
}

class PlaidReconciliationServiceClass {
  /**
   * Roda reconciliação para todos os coworks com conta Plaid linkada.
   * Pega transações RECEBIDAS (received > 0) sem invoice_match nas últimas N horas.
   */
  public async reconcileAll(sinceHours = 48): Promise<ReconciliationResult> {
    const result: ReconciliationResult = { scanned: 0, matched: 0, ambiguous: 0 };
    const since = DateTime.now().minus({ hours: sinceHours }).toJSDate();

    const linkedAccounts = await LinkedBankAccount.query().whereNull('deleted_at');
    for (const acc of linkedAccounts) {
      try {
        const txs = await BankAccountTransaction.query()
          .whereHas('linkedBankAccount', (q: any) => {
            q.where('id', acc.id);
          })
          .where('received', '>', 0)
          .where('created_at', '>=', since)
          // Não foi marcada como reconciliada ainda
          .where((q) => q.whereNull('status').orWhere('status', '!=', 'reconciled'))
          .limit(200);

        for (const tx of txs) {
          result.scanned++;
          const matched = await this.tryMatch(tx, acc.coworkAccountId);
          if (matched === 'matched') result.matched++;
          else if (matched === 'ambiguous') result.ambiguous++;
        }
      } catch (err) {
        Logger.error({ err, linkedAccountId: acc.id }, 'PlaidReconciliation: falhou para 1 conta');
      }
    }
    return result;
  }

  /**
   * Tenta casar uma transação com uma invoice.
   * Retorna: 'matched' | 'ambiguous' | 'no_match'
   */
  private async tryMatch(
    tx: BankAccountTransaction,
    coworkAccountId: number
  ): Promise<'matched' | 'ambiguous' | 'no_match'> {
    const txAmount = tx.received; // valor em centavos
    if (!txAmount || txAmount <= 0) return 'no_match';
    if (!tx.date) return 'no_match';

    // Buscar invoices candidatas: mesmo cowork, em aberto, valor exato, próximas do vencimento
    const candidates = await Invoice.query()
      .where('cowork_account_id', coworkAccountId)
      .whereIn('status', [
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.VIEWED,
        InvoiceStatusEnum.PARTLY_PAID,
        InvoiceStatusEnum.OVERDUE,
      ])
      .where('total', txAmount)
      .whereNull('deleted_at')
      .limit(10);

    if (candidates.length === 0) return 'no_match';

    // 1. Match exato por valor + descrição contém invoice_id ou invoice_number
    const descLower = (tx.description || '').toLowerCase();
    const byReference = candidates.filter((inv: any) => {
      const idStr = String(inv.id);
      const numStr = String(inv.invoiceNumber || '');
      return descLower.includes(idStr) || (numStr && descLower.includes(numStr.toLowerCase()));
    });
    if (byReference.length === 1) {
      await this.markReconciled(tx, byReference[0], 'reference_match');
      return 'matched';
    }
    if (byReference.length > 1) return 'ambiguous';

    // 2. Match por janela de vencimento ±3 dias
    const txDate = tx.date;
    const byDueDate = candidates.filter((inv: any) => {
      if (!inv.dueDate) return false;
      const diff = Math.abs(inv.dueDate.diff(txDate, 'days').days);
      return diff <= MATCH_WINDOW_DAYS;
    });
    if (byDueDate.length === 1) {
      await this.markReconciled(tx, byDueDate[0], 'due_date_window');
      return 'matched';
    }
    if (byDueDate.length > 1) return 'ambiguous';

    // 3. Match único geral (se candidates tem só 1 candidato, é provavelmente ela)
    if (candidates.length === 1) {
      await this.markReconciled(tx, candidates[0], 'unique_amount');
      return 'matched';
    }

    return 'ambiguous';
  }

  /** Marca transação como reconciliada e atualiza invoice como paga. */
  private async markReconciled(
    tx: BankAccountTransaction,
    invoice: Invoice,
    matchType: string
  ): Promise<void> {
    const trx: TransactionClientContract = await Database.transaction();
    try {
      tx.status = 'reconciled';
      await tx.useTransaction(trx).save();

      // Adiciona payment_history pra audit trail
      await PaymentHistory.create(
        {
          paymentId: null as any, // sem payment direto — vem de conta bancária
          status: PaymentStatusEnum.SUCCEEDED,
          amount: tx.received,
          sellerMessage: `Plaid reconciliation (${matchType}, tx#${tx.id})`,
        } as any,
        { client: trx }
      );

      // Atualiza invoice
      invoice.status = InvoiceStatusEnum.FULLY_PAID as any;
      await invoice.useTransaction(trx).save();

      await trx.commit();
      Logger.info(
        { txId: tx.id, invoiceId: invoice.id, matchType, amount: tx.received },
        'PlaidReconciliation: matched'
      );
    } catch (err) {
      await trx.rollback();
      Logger.error({ err, txId: tx.id, invoiceId: invoice.id }, 'PlaidReconciliation: rollback');
    }
  }
}

export const PlaidReconciliationService = new PlaidReconciliationServiceClass();
export default PlaidReconciliationService;
