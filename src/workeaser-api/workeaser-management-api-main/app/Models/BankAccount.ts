import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import User from 'App/Models/User';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class BankAccount extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column({ serializeAs: null })
  public gatewayId: string;

  @column({ serializeAs: null })
  public integrationService: string;

  @column()
  public nickname: string;

  @column()
  public holderName: string;

  @column()
  public holderType: string;

  @column()
  public bankName: string;

  @column()
  public country?: string;

  @column()
  public currency: string;

  @column()
  public lastDigits: string;

  @column()
  public routingNumber: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
