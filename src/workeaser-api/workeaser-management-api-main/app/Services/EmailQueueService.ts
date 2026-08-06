/**
 * EmailQueueService — fila durável para email transacional.
 * Sprint B (HF-SPRINT-B-08).
 *
 * Por que existe:
 *  - Antes: backend chamava Mail.send() sincronamente. Request travava esperando SES.
 *    Se SES caía, request 500 + experiência ruim.
 *  - Agora: backend chama EmailQueueService.enqueue() → row salva → return imediato.
 *    Worker ProcessEmailQueue (cron 1min) processa em batch, com retry + backoff.
 *
 * Templates: usa Edge views (resources/views/emails/{template_code}.edge) se template_code
 * for fornecido. Senão, usa body_html/body_text raw.
 */
import Env from '@ioc:Adonis/Core/Env';
import Logger from '@ioc:Adonis/Core/Logger';
import View from '@ioc:Adonis/Core/View';
import Mail from '@ioc:Adonis/Addons/Mail';
import { DateTime } from 'luxon';
import EmailQueueItem, { EmailQueueStatus } from 'App/Models/EmailQueueItem';

export interface EnqueueEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  /** Nome de view Edge (sem .edge) em resources/views/emails/ */
  templateCode?: string;
  templateData?: Record<string, unknown>;
  /** Se template não for fornecido, usa este HTML raw */
  bodyHtml?: string;
  bodyText?: string;
  attachments?: Array<{ name: string; contentBase64: string; contentType: string }>;
  /** Quando deve tentar enviar (default: agora) */
  scheduleAt?: DateTime;
  maxAttempts?: number;
  relatedUserId?: number;
  relatedType?: string;
  relatedId?: number;
}

const DEFAULT_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || 'noreply@workeaser.com';
const DEFAULT_FROM_NAME = process.env.MAIL_FROM_NAME || 'Workeaser';
const DEFAULT_MAX_ATTEMPTS = 5;
const BATCH_SIZE = 20;
/** Backoff exponencial entre tentativas (em segundos): 30s, 2min, 10min, 1h, 6h */
const BACKOFF_SECONDS = [30, 120, 600, 3600, 21600];

class EmailQueueServiceClass {
  /** Enfileira um email para envio assíncrono. Retorna imediatamente. */
  public async enqueue(opts: EnqueueEmailOptions): Promise<EmailQueueItem> {
    if (!opts.to || !opts.subject) {
      throw new Error('EmailQueueService.enqueue: to e subject são obrigatórios');
    }
    if (!opts.templateCode && !opts.bodyHtml && !opts.bodyText) {
      throw new Error('EmailQueueService.enqueue: precisa de templateCode OU bodyHtml/bodyText');
    }

    return EmailQueueItem.create({
      toEmail: opts.to,
      toName: opts.toName ?? null,
      fromEmail: DEFAULT_FROM_EMAIL,
      subject: opts.subject,
      bodyHtml: opts.bodyHtml ?? null,
      bodyText: opts.bodyText ?? null,
      templateCode: opts.templateCode ?? null,
      templateData: opts.templateData ?? null,
      attachments: opts.attachments ?? null,
      status: 'pending' as EmailQueueStatus,
      attempts: 0,
      maxAttempts: opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      nextAttemptAt: opts.scheduleAt ?? DateTime.now(),
      relatedUserId: opts.relatedUserId ?? null,
      relatedType: opts.relatedType ?? null,
      relatedId: opts.relatedId ?? null,
    });
  }

  /**
   * Worker: pega batch de emails pendentes vencidos e tenta enviar.
   * Chamado pela Task ProcessEmailQueue (cron 1min).
   */
  public async processBatch(): Promise<{ sent: number; failed: number; skipped: number }> {
    const now = DateTime.now();
    const pending = await EmailQueueItem.query()
      .whereIn('status', ['pending', 'failed'])
      .where((q) => {
        q.whereNull('next_attempt_at').orWhere('next_attempt_at', '<=', now.toJSDate());
      })
      .whereRaw('attempts < max_attempts')
      .orderBy('created_at', 'asc')
      .limit(BATCH_SIZE);

    if (pending.length === 0) return { sent: 0, failed: 0, skipped: 0 };

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // HF-SPRINT-D-03: skip users com email_bouncing=true ou email_complaint=true.
    // Query em batch pra evitar N+1.
    const toEmails = [...new Set(pending.map((p) => p.toEmail))];
    let blockedEmails = new Set<string>();
    try {
      const UserMod = await import('App/Models/User');
      const blockedRows = await UserMod.default.query()
        .whereIn('email', toEmails)
        .where((q) => q.where('email_bouncing', true).orWhere('email_complaint', true))
        .select('email');
      blockedEmails = new Set<string>(blockedRows.map((u: any) => u.email));
    } catch (err) {
      Logger.warn({ err }, 'EmailQueue blocklist query falhou — continuando sem skip');
    }

    for (const item of pending) {
      if (blockedEmails.has(item.toEmail)) {
        item.status = 'bounced';
        item.lastError = 'Skipped: user.email_bouncing OR user.email_complaint';
        await item.save();
        skipped++;
        continue;
      }
      try {
        // Marca sending pra evitar race condition (se 2 workers rodarem)
        item.status = 'sending';
        item.attempts += 1;
        await item.save();

        await this.sendOne(item);

        item.status = 'sent';
        item.sentAt = DateTime.now();
        item.lastError = null;
        await item.save();
        sent++;
      } catch (err: any) {
        item.lastError = String(err?.message || err).slice(0, 480);
        item.status = item.attempts >= item.maxAttempts ? 'failed' : 'pending';
        // Backoff exponencial
        const backoffIdx = Math.min(item.attempts - 1, BACKOFF_SECONDS.length - 1);
        item.nextAttemptAt = DateTime.now().plus({ seconds: BACKOFF_SECONDS[backoffIdx] });
        await item.save();
        Logger.warn({ err, itemId: item.id, attempts: item.attempts }, 'email send failed — will retry');
        failed++;
      }
    }

    return { sent, failed, skipped };
  }

  /** Envia um email específico via Adonis Mail. */
  private async sendOne(item: EmailQueueItem): Promise<void> {
    const fromEmail = item.fromEmail || DEFAULT_FROM_EMAIL;

    // Renderizar template Edge se template_code fornecido
    let html = item.bodyHtml || '';
    if (item.templateCode) {
      try {
        html = await View.render(`emails/${item.templateCode}`, item.templateData || {});
      } catch (err) {
        Logger.error({ err, template: item.templateCode }, 'Template não encontrado/erro');
        throw new Error(`Template ${item.templateCode} não encontrado: ${err.message}`);
      }
    }

    await Mail.send((message) => {
      message
        .from(fromEmail, DEFAULT_FROM_NAME)
        .to(item.toEmail, item.toName || undefined)
        .subject(item.subject);

      if (html) message.html(html);
      if (item.bodyText) message.text(item.bodyText);

      if (item.attachments && item.attachments.length > 0) {
        for (const att of item.attachments) {
          message.attachData(Buffer.from(att.contentBase64, 'base64'), {
            filename: att.name,
            contentType: att.contentType,
          });
        }
      }
    });

    // Stripe-style: provider_message_id ideal seria capturado do response do SES,
    // mas Adonis Mail não expõe isso uniformemente. Logar timestamp por enquanto.
    item.providerMessageId = `sent_${Date.now()}`;
  }

  /** Estatísticas pra dashboard (admin futuro). */
  public async getStats(sinceHours = 24): Promise<Record<string, number>> {
    const since = DateTime.now().minus({ hours: sinceHours });
    const rows = await EmailQueueItem.query()
      .where('created_at', '>=', since.toJSDate())
      .groupBy('status')
      .count('* as count')
      .select('status');
    const stats: Record<string, number> = { pending: 0, sending: 0, sent: 0, failed: 0, bounced: 0 };
    rows.forEach((r: any) => {
      stats[r.status] = parseInt(r.$extras.count, 10) || 0;
    });
    return stats;
  }
}

export const EmailQueueService = new EmailQueueServiceClass();
export default EmailQueueService;

// Silencia warning de "Env unused" — pode ser usado em sobrecargas futuras
void Env;
