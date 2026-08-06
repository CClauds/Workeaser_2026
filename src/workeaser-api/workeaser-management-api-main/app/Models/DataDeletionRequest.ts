/**
 * DataDeletionRequest — modelo Lucid para data_deletion_requests.
 * Sprint B (HF-SPRINT-B-01).
 *
 * Workflow: requested → in_progress → completed/rejected/canceled_by_user
 * Janela de retratação: 7 dias entre `requested_at` e `scheduled_execution_at`.
 */
import { BaseModel, BelongsTo, belongsTo, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';
import User from './User';

export type DataDeletionStatus =
  | 'requested'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'canceled_by_user';

export default class DataDeletionRequest extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'data_deletion_requests';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @column()
  public requesterEmailSnapshot: string;

  @column()
  public status: DataDeletionStatus;

  @column()
  public reason: string | null;

  @column()
  public rejectionReason: string | null;

  @column.dateTime()
  public requestedAt: DateTime;

  @column.dateTime()
  public scheduledExecutionAt: DateTime | null;

  @column.dateTime()
  public completedAt: DateTime | null;

  @column()
  public processedByAdminEmail: string | null;

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
  public redactedFieldsSummary: Record<string, unknown> | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => User, { foreignKey: 'userId' })
  public user: BelongsTo<typeof User>;

  /** Quantos dias de retratação restam (negativo = pode processar). */
  public daysUntilExecution(): number {
    if (!this.scheduledExecutionAt) return Number.POSITIVE_INFINITY;
    return Math.ceil(this.scheduledExecutionAt.diffNow('days').days);
  }

  /** Pode ser executado agora? */
  public canExecuteNow(): boolean {
    return (
      this.status === 'requested' &&
      this.scheduledExecutionAt !== null &&
      this.scheduledExecutionAt <= DateTime.now()
    );
  }
}
