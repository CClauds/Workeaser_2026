/**
 * WebhookDeadLetterItem — modelo Lucid para webhook_dead_letter_queue.
 * Sprint H (HF-SPRINT-H-08).
 */
import { BaseModel, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

export type DLQStatus = 'pending' | 'processing' | 'resolved' | 'failed';

export default class WebhookDeadLetterItem extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'webhook_dead_letter_queue';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public provider: string;

  @column()
  public eventType: string;

  @column()
  public eventId: string | null;

  @column()
  public payload: string;

  @column()
  public status: DLQStatus;

  @column()
  public attempts: number;

  @column()
  public maxAttempts: number;

  @column.dateTime()
  public nextAttemptAt: DateTime | null;

  @column.dateTime()
  public resolvedAt: DateTime | null;

  @column()
  public lastError: string | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public canRetry(): boolean {
    return this.status === 'pending' && this.attempts < this.maxAttempts;
  }
}
