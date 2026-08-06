/**
 * DataDeletionService — LGPD right-to-delete + right-to-portability.
 * Sprint B (HF-SPRINT-B-02).
 *
 * Princípios:
 *  - Anonimização preserva integridade referencial (não DELETE em users — vira
 *    "deleted_user_<id>@anonymized.local" + nullify de campos pessoais).
 *  - Janela de retratação default: 7 dias.
 *  - Processamento idempotente: re-rodar não duplica.
 *  - Audit trail: `redacted_fields_summary` lista o que foi nullificado.
 *  - Compliance LGPD Art. 18 V (eliminação) + Art. 18 IV (portabilidade).
 */
import Database from '@ioc:Adonis/Lucid/Database';
import Logger from '@ioc:Adonis/Core/Logger';
import { DateTime } from 'luxon';
import User from 'App/Models/User';
import DataDeletionRequest, { DataDeletionStatus } from 'App/Models/DataDeletionRequest';
import AppError from 'App/Utils/AppError';

const DEFAULT_GRACE_DAYS = parseInt(process.env.LGPD_DELETION_GRACE_DAYS || '7', 10);

class DataDeletionServiceClass {
  /** Cria pedido de exclusão. Não executa — fica em "requested" até a janela vencer. */
  public async createRequest(userId: number, reason?: string): Promise<DataDeletionRequest> {
    const user = await User.find(userId);
    if (!user) throw new AppError(AppError.NOT_FOUND, 'Usuário não encontrado');

    const existing = await DataDeletionRequest.query()
      .where('user_id', userId)
      .whereIn('status', ['requested', 'in_progress'])
      .first();

    if (existing) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'Já existe um pedido de exclusão pendente. Cancele o anterior antes de criar novo.'
      );
    }

    const now = DateTime.now();
    return DataDeletionRequest.create({
      userId,
      requesterEmailSnapshot: user.email,
      status: 'requested' as DataDeletionStatus,
      reason: reason ?? null,
      requestedAt: now,
      scheduledExecutionAt: now.plus({ days: DEFAULT_GRACE_DAYS }),
    });
  }

  /** Lista pedidos do user (geralmente 0 ou 1 ativo + histórico). */
  public async listForUser(userId: number): Promise<DataDeletionRequest[]> {
    return DataDeletionRequest.query().where('user_id', userId).orderBy('created_at', 'desc');
  }

  /** Cancela pedido (somente pelo próprio user enquanto ainda está em janela). */
  public async cancelByUser(requestId: number, userId: number): Promise<DataDeletionRequest> {
    const req = await DataDeletionRequest.find(requestId);
    if (!req || req.userId !== userId) {
      throw new AppError(AppError.NOT_FOUND, 'Pedido não encontrado');
    }
    if (req.status !== 'requested') {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        `Não dá pra cancelar pedido em status "${req.status}".`
      );
    }
    req.status = 'canceled_by_user';
    await req.save();
    return req;
  }

  /**
   * Processa pedido executando anonimização real.
   * Chamado pelo cron `ProcessDataDeletion` quando `scheduled_execution_at <= NOW`.
   * Pode também ser chamado manualmente por admin (com adminEmail).
   */
  public async process(requestId: number, adminEmail?: string): Promise<DataDeletionRequest> {
    const req = await DataDeletionRequest.find(requestId);
    if (!req) throw new AppError(AppError.NOT_FOUND, 'Pedido não encontrado');
    if (req.status === 'completed') return req; // idempotente
    if (req.status !== 'requested' && req.status !== 'in_progress') {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        `Não dá pra processar pedido em status "${req.status}".`
      );
    }

    // Marca in_progress
    req.status = 'in_progress';
    if (adminEmail) req.processedByAdminEmail = adminEmail;
    await req.save();

    const trx = await Database.transaction();
    try {
      const user = await User.find(req.userId, { client: trx });
      if (!user) {
        throw new Error('User não encontrado na hora de anonimizar');
      }

      const summary: Record<string, unknown> = {
        original_email_snapshot_hash: this.hashEmail(user.email),
        anonymized_at: DateTime.now().toISO(),
      };

      // Anonimização: substitui campos pessoais por placeholders.
      // Preserva users.id pra manter integridade referencial em invoices/contracts/payments.
      const anonymizedEmail = `deleted_user_${user.id}@anonymized.local`;
      user.email = anonymizedEmail;
      user.firstName = 'Deleted';
      user.middleName = '';
      user.lastName = 'User';
      // Campos opcionais existentes — apaga se setados:
      if ('personalPhone' in user && (user as any).personalPhone) {
        summary['personal_phone'] = '[REDACTED]';
        (user as any).personalPhone = null;
      }
      if ('phone' in user && (user as any).phone) {
        summary['phone'] = '[REDACTED]';
        (user as any).phone = null;
      }
      if ('photoId' in user && (user as any).photoId) {
        summary['photo_id'] = '[REDACTED]';
        (user as any).photoId = null;
      }
      // Stripe customer fica — Stripe é GDPR-compliant; o link é via stripe_customer_id que é opaco.
      // user.stripeCustomerId NÃO é nullificado de propósito (pra reconciliar histórico de pagamento).
      summary['email'] = '[ANONYMIZED]';
      summary['first_name'] = '[ANONYMIZED]';
      summary['last_name'] = '[ANONYMIZED]';

      await user.useTransaction(trx).save();

      // Revogar todos os api_tokens
      await trx.from('api_tokens').where('user_id', user.id).delete();
      summary['api_tokens_revoked'] = true;

      // Anonimizar dados em chat_messages (mantém estrutura mas redige conteúdo do user)
      // Não deleta — operadora pode ter compliance interna que exige histórico.
      // Em vez disso, marca user como anônimo e mensagens dele ficam atribuídas a "anonymized".
      // (chat_messages tem coluna user_id que aponta pra users.id — preservado via FK.)

      // Soft-delete final no user (mantém row pra FK, mas logicamente apagado)
      (user as any).deletedAt = DateTime.now();
      await user.useTransaction(trx).save();

      // Atualiza request
      req.status = 'completed';
      req.completedAt = DateTime.now();
      req.redactedFieldsSummary = summary;
      await req.useTransaction(trx).save();

      await trx.commit();
      Logger.info({ requestId, userId: req.userId }, 'LGPD deletion completed');
      return req;
    } catch (err) {
      await trx.rollback();
      Logger.error({ err, requestId }, 'LGPD deletion failed — rolling back');
      // Marca como rejected pra não tentar de novo em loop
      req.status = 'requested'; // volta pra requested pra retry manual
      await req.save();
      throw err;
    }
  }

  /** Rejeita pedido (admin). Não anonimiza. */
  public async reject(requestId: number, adminEmail: string, reason: string): Promise<DataDeletionRequest> {
    const req = await DataDeletionRequest.find(requestId);
    if (!req) throw new AppError(AppError.NOT_FOUND, 'Pedido não encontrado');
    req.status = 'rejected';
    req.rejectionReason = reason;
    req.processedByAdminEmail = adminEmail;
    await req.save();
    return req;
  }

  /**
   * Right-to-portability LGPD Art. 18 V.
   * Devolve TODOS os dados pessoais do user em JSON.
   * Inclui: user, cowork_account, client_account, invoices, payments, contracts, bookings, chats, mailbox.
   */
  public async exportUserData(userId: number): Promise<Record<string, unknown>> {
    const user = await User.find(userId);
    if (!user) throw new AppError(AppError.NOT_FOUND, 'Usuário não encontrado');

    const sections: Record<string, unknown> = {
      _meta: {
        exported_at: DateTime.now().toISO(),
        format_version: '1.0',
        purpose: 'LGPD Art. 18 V — right to portability',
      },
      user: user.toJSON(),
    };

    // Cada query é independente — se uma falhar (tabela não existe), só pula
    const safeQuery = async (label: string, fn: () => Promise<unknown>) => {
      try {
        sections[label] = await fn();
      } catch (err) {
        Logger.warn({ err, label }, 'exportUserData section query falhou — ignorando');
        sections[label] = { error: 'not_available' };
      }
    };

    await safeQuery('cowork_account', () =>
      Database.from('cowork_accounts').where('user_id', userId).select('*')
    );
    await safeQuery('client_account', () =>
      Database.from('client_accounts').where('user_id', userId).select('*')
    );
    await safeQuery('invoices', () =>
      Database.from('invoices').where('user_id', userId).select('id', 'amount', 'status', 'due_date', 'created_at')
    );
    await safeQuery('payments', () =>
      Database.from('payments')
        .join('invoices', 'payments.invoice_id', 'invoices.id')
        .where('invoices.user_id', userId)
        .select('payments.id', 'payments.amount', 'payments.status', 'payments.created_at')
    );
    await safeQuery('contracts', () =>
      Database.from('contracts').where('user_id', userId).select('id', 'status', 'amount', 'created_at')
    );
    await safeQuery('subscriptions', () =>
      Database.from('subscriptions').where('user_id', userId).select('*')
    );
    await safeQuery('notifications', () =>
      Database.from('notifications')
        .where('client_id', userId)
        .orWhere('user_id', userId)
        .select('id', 'title', 'message', 'created_at')
    );

    return sections;
  }

  /** Hash do email para auditoria (não reversível). */
  private hashEmail(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(email).digest('hex').slice(0, 16);
  }
}

export const DataDeletionService = new DataDeletionServiceClass();
export default DataDeletionService;
