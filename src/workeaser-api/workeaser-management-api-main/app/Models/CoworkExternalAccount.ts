import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import CoworkStripeAccount from 'App/Models/CoworkStripeAccount';

export default class CoworkExternalAccount extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkStripeAccountId: number;

  @belongsTo(() => CoworkStripeAccount)
  public coworkStripeAccount: BelongsTo<typeof CoworkStripeAccount>;

  @column()
  public stripeId: string;

  @column()
  public type: string;

  @column()
  public holderName: string | null;

  @column()
  public holderType: string | null;

  @column()
  public bankName: string | null;

  @column()
  public country: string | null;

  @column()
  public lastDigits: string | null;

  @column()
  public routingNumber: string | null;

  @column()
  public brand: string | null;

  @column()
  public expMonth: number | null;

  @column()
  public expYear: number | null;

  @column()
  public defaultForCurrency: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
