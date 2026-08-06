import Hash from '@ioc:Adonis/Core/Hash';
import {
  beforeCreate,
  beforeSave,
  belongsTo,
  BelongsTo,
  column,
  hasMany,
  HasMany,
  hasOne,
  HasOne
} from '@ioc:Adonis/Lucid/Orm';
import Address from 'App/Models/Address';
import BankAccount from 'App/Models/BankAccount';
import Card from 'App/Models/Card';
import ClientAccount from 'App/Models/ClientAccount';
import Contract from 'App/Models/Contract';
import CoworkUser from 'App/Models/CoworkUser';
import Invoice from 'App/Models/Invoice';
import Photo from 'App/Models/Photo';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import UserEmailActivation from 'App/Models/UserEmailActivation';
import UserIntegration from 'App/Models/UserIntegration';
import UserLostPassword from 'App/Models/UserLostPassword';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class User extends SoftDeleteBaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public firstName: string;

  @column()
  public middleName: string;

  @column()
  public lastName: string;

  @column()
  public email: string;

  // HF-SPRINT-A-01: Stripe Customer reutilizável entre subscriptions/payment methods.
  @column()
  public stripeCustomerId: string | null;

  @column({ serializeAs: null })
  public password: string;

  @column({ serializeAs: null })
  public emailConfirmed: boolean;

  // HF-SPRINT-D-02: deliverability flags — pular envio se bouncing/complaint
  @column({ serializeAs: null })
  public emailBouncing: boolean;

  @column({ serializeAs: null })
  public emailComplaint: boolean;

  @column.dateTime({ serializeAs: null })
  public emailBouncingAt: import('luxon').DateTime | null;

  @column({ serializeAs: null })
  public emailBouncingReason: string | null;

  // HF-SPRINT-D-02: 2FA TOTP — secret cifrado via SecretCipher
  @column({ serializeAs: null })
  public twoFactorEnabled: boolean;

  @column({ serializeAs: null })
  public twoFactorSecretCipher: string | null;

  @column({ serializeAs: null })
  public twoFactorBackupCodesCipher: string | null;

  @column.dateTime({ serializeAs: null })
  public twoFactorEnabledAt: import('luxon').DateTime | null;

  @column({ serializeAs: null })
  public photoId: number;

  @belongsTo(() => Photo)
  public photo: BelongsTo<typeof Photo>;

  @column()
  public role: string;

  @column()
  public personalPhone: string | null;

  @column()
  public phone: string;

  @column({ serializeAs: null })
  public personalAddressId: number;

  @belongsTo(() => Address, { foreignKey: 'personalAddressId' })
  public personalAddress: BelongsTo<typeof Address>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasOne(() => CoworkUser)
  public coworkUser: HasOne<typeof CoworkUser>;

  @hasOne(() => ClientAccount)
  public clientAccount: HasOne<typeof ClientAccount>;

  @hasOne(() => UserEmailActivation)
  public userEmailActivationTokens: HasOne<typeof UserEmailActivation>;

  @hasOne(() => UserLostPassword)
  public userLostPassword: HasOne<typeof UserLostPassword>;

  @hasMany(() => UserIntegration)
  public integrations: HasMany<typeof UserIntegration>;

  @hasMany(() => Card)
  public cards: HasMany<typeof Card>;

  @hasMany(() => BankAccount)
  public bankAccounts: HasMany<typeof BankAccount>;

  @hasMany(() => Contract)
  public contracts: HasMany<typeof Contract>;

  @hasMany(() => Invoice)
  public invoices: HasMany<typeof Invoice>;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  public get fullName() {
    return `${this.firstName} ${this.middleName} ${this.lastName}`;
  }

  static get fillable() {
    return ['first_name', 'middle_name', 'last_name', 'email', 'password', 'photo_id', 'personal_phone', 'phone'];
  }

  @beforeCreate()
  public static async generateUUID(model: User) {
    model.uuid = uuidv4();
  }
}
