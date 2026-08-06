/**
 * AdminAuditService — registra eventos auditáveis do Admin API.
 * Polish Lote (HF-POLISH-03).
 *
 * Princípios:
 *  - `log()` é fire-and-forget: erro em audit NÃO propaga para o caller.
 *  - Nunca grava senha, token, header Authorization, body cru.
 *  - `metadata` deve conter só chaves não-sensíveis (ids, nomes públicos, flags).
 *  - `outcome` separa success/failure para forense.
 */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import AdminAuditLog, { AuditOutcome } from 'App/Models/AdminAuditLog'

export type AuditEvent =
  | 'admin.login'
  | 'admin.logout'
  | 'partner.create'
  | 'partner.update'
  | 'partner.delete'
  | 'user.suspend'
  | 'user.reactivate'
  | 'client.create'
  | 'client.update'
  | 'client.delete'
  | 'cowork.create'
  | 'cowork.update'
  | 'cowork.delete'

export interface AuditOptions {
  event: AuditEvent
  ctx?: HttpContextContract
  actorPartnerId?: number | null
  actorEmail?: string | null
  targetType?: string | null
  targetId?: number | null
  outcome?: AuditOutcome
  metadata?: Record<string, unknown> | null
}

function clientIp(ctx?: HttpContextContract): string | null {
  if (!ctx) return null
  const xff = ctx.request.header('x-forwarded-for')
  return (typeof xff === 'string' ? xff.split(',')[0].trim() : '') || ctx.request.ip() || null
}

function clientUserAgent(ctx?: HttpContextContract): string | null {
  if (!ctx) return null
  const ua = ctx.request.header('user-agent')
  if (!ua) return null
  return String(ua).slice(0, 250)
}

class AdminAuditServiceClass {
  public async log(opts: AuditOptions): Promise<void> {
    try {
      await AdminAuditLog.create({
        event: opts.event,
        actorPartnerId: opts.actorPartnerId ?? null,
        actorEmail: opts.actorEmail ?? null,
        targetType: opts.targetType ?? null,
        targetId: opts.targetId ?? null,
        ip: clientIp(opts.ctx),
        userAgent: clientUserAgent(opts.ctx),
        outcome: opts.outcome ?? 'success',
        metadata: opts.metadata ?? null,
      })
    } catch (err) {
      // Audit NUNCA deve quebrar o fluxo principal. Log e segue.
      Logger.error({ err, event: opts.event }, 'admin audit log failed')
    }
  }
}

export const AdminAuditService = new AdminAuditServiceClass()
export default AdminAuditService
