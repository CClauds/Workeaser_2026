import {
  BaseModel,
  column,
  hasOne,
  HasOne,
  SnakeCaseNamingStrategy,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import CoworkAccount from './CoworkAccount'
import ClientAccount from './ClientAccount'

/**
 * Read-only mirror of the `users` table managed by workeaser-api.
 */
export default class User extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()
  public static table = 'users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public uuid: string

  @column()
  public firstName: string

  @column()
  public middleName: string | null

  @column()
  public lastName: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public role: string

  @column()
  public emailConfirmed: boolean

  @column()
  public personalPhone: string | null

  @column()
  public photoId: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime | null

  public get fullName() {
    return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ')
  }

  @hasOne(() => CoworkAccount, { foreignKey: 'userId' })
  public coworkAccount: HasOne<typeof CoworkAccount>

  @hasOne(() => ClientAccount, { foreignKey: 'userId' })
  public clientAccount: HasOne<typeof ClientAccount>
}
