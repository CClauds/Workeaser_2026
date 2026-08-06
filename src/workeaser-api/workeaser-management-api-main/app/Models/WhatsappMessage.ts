/**
 * WhatsappMessage — modelo Lucid para tabela whatsapp_messages.
 * Sprint C (HF-SPRINT-C-01).
 */
import { BaseModel, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

export type WhatsappDirection = 'outbound' | 'inbound';
export type WhatsappStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';
export type WhatsappProvider = 'meta_cloud' | 'twilio' | 'zapi';

export default class WhatsappMessage extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'whatsapp_messages';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public provider: WhatsappProvider;

  @column()
  public direction: WhatsappDirection;

  @column()
  public toPhone: string;

  @column()
  public fromPhone: string | null;

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

  @column()
  public body: string | null;

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
  public media: Array<{ type: string; url: string; caption?: string }> | null;

  @column()
  public status: WhatsappStatus;

  @column()
  public providerMessageId: string | null;

  @column()
  public errorCode: string | null;

  @column()
  public errorMessage: string | null;

  @column()
  public relatedUserId: number | null;

  @column()
  public relatedType: string | null;

  @column()
  public relatedId: number | null;

  @column.dateTime()
  public sentAt: DateTime | null;

  @column.dateTime()
  public deliveredAt: DateTime | null;

  @column.dateTime()
  public readAt: DateTime | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
