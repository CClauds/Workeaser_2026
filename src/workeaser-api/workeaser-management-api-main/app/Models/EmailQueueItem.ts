/**
 * EmailQueueItem — modelo Lucid para a tabela email_queue.
 * Sprint B (HF-SPRINT-B-07).
 */
import { BaseModel, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

export type EmailQueueStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'bounced';

export default class EmailQueueItem extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'email_queue';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public toEmail: string;

  @column()
  public toName: string | null;

  @column()
  public fromEmail: string;

  @column()
  public subject: string;

  @column()
  public bodyHtml: string | null;

  @column()
  public bodyText: string | null;

  @column()
  public templateCode: string | null;

  @column({
    prepare: (v: unknown) => (v == null ? null : JSON.stringify(v)),
    consume: (v: unknown) => {
      if (v == null) return null;
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return null; }
      }
      return v;
    },
  })
  public templateData: Record<string, unknown> | null;

  @column({
    prepare: (v: unknown) => (v == null ? null : JSON.stringify(v)),
    consume: (v: unknown) => {
      if (v == null) return null;
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return null; }
      }
      return v;
    },
  })
  public attachments: Array<{ name: string; contentBase64: string; contentType: string }> | null;

  @column()
  public status: EmailQueueStatus;

  @column()
  public attempts: number;

  @column()
  public maxAttempts: number;

  @column.dateTime()
  public nextAttemptAt: DateTime | null;

  @column.dateTime()
  public sentAt: DateTime | null;

  @column()
  public providerMessageId: string | null;

  @column()
  public lastError: string | null;

  @column()
  public relatedUserId: number | null;

  @column()
  public relatedType: string | null;

  @column()
  public relatedId: number | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public canRetry(): boolean {
    return (
      (this.status === 'failed' || this.status === 'pending') &&
      this.attempts < this.maxAttempts
    );
  }
}
