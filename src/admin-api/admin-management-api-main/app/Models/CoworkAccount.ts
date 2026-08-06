import { BaseModel, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

/**
 * Read-only mirror of the `cowork_accounts` table managed by workeaser-api.
 * Admin-api uses this to list/inspect coworking customers — never to write.
 *
 * Note: cowork_accounts does NOT have a direct `user_id` column. The owner
 * link goes through the join table `cowork_users` (a single cowork can have
 * multiple managers/users). Admin-api intentionally does not preload that
 * relation here to keep this model lean — use `cowork_users` queries directly
 * if owner data is needed.
 */
export default class CoworkAccount extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static table = 'cowork_accounts'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string | null

  @column()
  public phone: string | null

  @column()
  public photoId: number | null

  @column()
  public uuid: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime | null
}
