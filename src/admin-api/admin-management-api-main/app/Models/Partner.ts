import Hash from '@ioc:Adonis/Core/Hash'
import {
  BaseModel,
  beforeCreate,
  beforeSave,
  column,
  SnakeCaseNamingStrategy,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { PartnerRoleEnum } from 'Contracts/enums'

export default class Partner extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy()

  public static fillable = [
    'firstName',
    'lastName',
    'email',
    'password',
    'role',
    'profileImageUrl',
  ]

  @column({ isPrimary: true })
  public id: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public role: PartnerRoleEnum

  @column()
  public profileImageUrl: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public deletedAt: DateTime | null

  public get fullName() {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  public get isDirector() {
    return this.role === PartnerRoleEnum.SYSTEM_DIRECTOR
  }

  @beforeSave()
  public static async hashPassword(partner: Partner) {
    if (partner.$dirty.password) {
      partner.password = await Hash.make(partner.password)
    }
  }

  @beforeCreate()
  public static async createUUID(model: Partner) {
    if (!model.id) {
      model.id = uuidv4()
    }
    if (!model.role) {
      model.role = PartnerRoleEnum.SYSTEM_MANAGER
    }
  }
}
