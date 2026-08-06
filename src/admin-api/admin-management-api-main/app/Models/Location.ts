import { BaseModel, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

/**
 * Read-only mirror of the `locations` table managed by workeaser-api.
 */
export default class Location extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static table = 'locations'

  @column({ isPrimary: true })
  public id: number

  @column()
  public coworkAccountId: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime | null
}
