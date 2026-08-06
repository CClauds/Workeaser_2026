/**
 * AdminAuditLog — modelo Lucid para admin_audit_logs.
 * Polish Lote (HF-POLISH-03).
 */
import { BaseModel, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export type AuditOutcome = 'success' | 'failure'

export default class AdminAuditLog extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static table = 'admin_audit_logs'

  @column({ isPrimary: true })
  public id: number

  @column()
  public event: string

  @column()
  public actorPartnerId: number | null

  @column()
  public actorEmail: string | null

  @column()
  public targetType: string | null

  @column()
  public targetId: number | null

  @column()
  public ip: string | null

  @column()
  public userAgent: string | null

  @column()
  public outcome: AuditOutcome

  @column({
    prepare: (v: unknown) => (v == null ? null : JSON.stringify(v)),
    consume: (v: unknown) => {
      if (v == null) return null
      if (typeof v === 'string') {
        try { return JSON.parse(v) } catch { return null }
      }
      return v
    },
  })
  public metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
