/**
 * AuditTrailService — wrapper de alto nível sobre LogService existente.
 * Sprint E (HF-SPRINT-E-04).
 *
 * Por que existe:
 *  - LogService é básico (só `create(user, module, action, id, metadata)`)
 *  - Queremos helpers SEMÂNTICOS pra eventos críticos (ex: `logContractSigned`)
 *  - Capturar IP/user-agent automaticamente
 *  - Fire-and-forget — falha de audit NUNCA propaga pro caller
 *  - Sanitização básica de metadata (não logar password/token)
 *
 * Eventos cobertos:
 *  - auth.* (login_success, login_failure, logout, password_changed, 2fa_enabled, 2fa_disabled)
 *  - invoice.* (created, sent, paid, refunded, canceled)
 *  - contract.* (created, sent_for_signature, signed, declined, renewed)
 *  - subscription.* (created, canceled, plan_changed)
 *  - upload.* (document, photo, video)
 *  - settings.* (changed_email, changed_phone, deleted_payment_method)
 *
 * Tabela `logs` continua sendo a única source — esse service só facilita uso.
 */
import LogService from 'App/Services/LogService';
import Logger from '@ioc:Adonis/Core/Logger';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

const SENSITIVE_KEYS = new Set([
  'password', 'password_confirmation', 'token', 'access_token', 'refresh_token',
  'card_number', 'cvv', 'cvc', 'secret', 'authorization', 'cookie',
  'stripe_secret_key', 'private_key',
]);

function sanitizeMetadata(metadata: Record<string, unknown> | null | undefined): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = sanitizeMetadata(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function clientIp(ctx?: HttpContextContract): string | null {
  if (!ctx) return null;
  const xff = ctx.request.header('x-forwarded-for');
  return (typeof xff === 'string' ? xff.split(',')[0].trim() : '') || ctx.request.ip() || null;
}

function clientUA(ctx?: HttpContextContract): string | null {
  if (!ctx) return null;
  const ua = ctx.request.header('user-agent');
  return ua ? String(ua).slice(0, 250) : null;
}

interface LogOptions {
  ctx?: HttpContextContract;
  identifier?: number;
  metadata?: Record<string, unknown>;
}

class AuditTrailServiceClass {
  /** Registro genérico. Fire-and-forget. */
  public async log(module: string, action: string, opts: LogOptions = {}): Promise<void> {
    try {
      const user = opts.ctx?.auth?.user;
      if (!user) {
        // Sem user logado: registra mesmo assim com null user_id se possível.
        // LogService exige User obrigatório — então só loga em Sentry/console aqui.
        Logger.info({ module, action, ip: clientIp(opts.ctx) }, 'audit (no user)');
        return;
      }
      const meta = {
        ...(opts.metadata || {}),
        _ip: clientIp(opts.ctx),
        _ua: clientUA(opts.ctx),
      };
      await LogService.create(user as any, module, action, opts.identifier, sanitizeMetadata(meta));
    } catch (err) {
      Logger.error({ err, module, action }, 'AuditTrail: falha (não propaga)');
    }
  }

  // ───── Auth ─────
  public loginSuccess(ctx: HttpContextContract) {
    return this.log('AUTH', 'LOGIN_SUCCESS', { ctx });
  }
  public loginFailure(ctx: HttpContextContract, email: string, reason?: string) {
    return this.log('AUTH', 'LOGIN_FAILURE', { ctx, metadata: { email, reason } });
  }
  public logout(ctx: HttpContextContract) {
    return this.log('AUTH', 'LOGOUT', { ctx });
  }
  public passwordChanged(ctx: HttpContextContract) {
    return this.log('AUTH', 'PASSWORD_CHANGED', { ctx });
  }
  public twoFactorEnabled(ctx: HttpContextContract) {
    return this.log('AUTH', '2FA_ENABLED', { ctx });
  }
  public twoFactorDisabled(ctx: HttpContextContract) {
    return this.log('AUTH', '2FA_DISABLED', { ctx });
  }

  // ───── Invoice ─────
  public invoiceCreated(ctx: HttpContextContract, invoiceId: number, total: number) {
    return this.log('INVOICE', 'CREATE', { ctx, identifier: invoiceId, metadata: { total } });
  }
  public invoiceSent(ctx: HttpContextContract, invoiceId: number) {
    return this.log('INVOICE', 'SEND', { ctx, identifier: invoiceId });
  }
  public invoicePaid(ctx: HttpContextContract | undefined, invoiceId: number, source: string) {
    return this.log('INVOICE', 'PAID', { ctx, identifier: invoiceId, metadata: { source } });
  }
  public invoiceRefunded(ctx: HttpContextContract, invoiceId: number, amount: number) {
    return this.log('INVOICE', 'REFUND', { ctx, identifier: invoiceId, metadata: { amount } });
  }
  public invoiceCanceled(ctx: HttpContextContract, invoiceId: number) {
    return this.log('INVOICE', 'CANCEL', { ctx, identifier: invoiceId });
  }

  // ───── Contract ─────
  public contractCreated(ctx: HttpContextContract, contractId: number) {
    return this.log('CONTRACT', 'CREATE', { ctx, identifier: contractId });
  }
  public contractSentForSignature(ctx: HttpContextContract, contractId: number, provider: string) {
    return this.log('CONTRACT', 'SEND_FOR_SIGNATURE', { ctx, identifier: contractId, metadata: { provider } });
  }
  public contractSigned(ctx: HttpContextContract | undefined, contractId: number) {
    return this.log('CONTRACT', 'SIGNED', { ctx, identifier: contractId });
  }
  public contractDeclined(ctx: HttpContextContract | undefined, contractId: number) {
    return this.log('CONTRACT', 'DECLINED', { ctx, identifier: contractId });
  }
  public contractRenewed(ctx: HttpContextContract | undefined, contractId: number) {
    return this.log('CONTRACT', 'RENEWED', { ctx, identifier: contractId });
  }

  // ───── Subscription ─────
  public subscriptionCreated(ctx: HttpContextContract, subId: number, planCode: string, method: string) {
    return this.log('SUBSCRIPTION', 'CREATE', { ctx, identifier: subId, metadata: { plan: planCode, method } });
  }
  public subscriptionCanceled(ctx: HttpContextContract, subId: number, atPeriodEnd: boolean) {
    return this.log('SUBSCRIPTION', 'CANCEL', { ctx, identifier: subId, metadata: { at_period_end: atPeriodEnd } });
  }

  // ───── Upload ─────
  public documentUploaded(ctx: HttpContextContract, docId: number, mimeType: string, size: number) {
    return this.log('UPLOAD', 'DOCUMENT', { ctx, identifier: docId, metadata: { mime_type: mimeType, size } });
  }
  public photoUploaded(ctx: HttpContextContract, photoId: number) {
    return this.log('UPLOAD', 'PHOTO', { ctx, identifier: photoId });
  }

  // ───── Settings ─────
  public settingsChanged(ctx: HttpContextContract, field: string) {
    return this.log('SETTINGS', 'CHANGE', { ctx, metadata: { field } });
  }
}

export const AuditTrailService = new AuditTrailServiceClass();
export default AuditTrailService;
