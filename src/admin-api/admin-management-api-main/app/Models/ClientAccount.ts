import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  SnakeCaseNamingStrategy,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import User from './User'

/**
 * Read-only mirror of the `client_accounts` table managed by workeaser-api.
 */
export default class ClientAccount extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static table = 'client_accounts'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyName: string | null

  @column()
  public companyEmail: string | null

  @column()
  public companyPhone: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  public user: BelongsTo<typeof User>
}
