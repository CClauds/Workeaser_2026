import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Payment from 'App/Models/Payment';

export default class PaymentHistory extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public paymentId: number;

  @belongsTo(() => Payment)
  public payment: BelongsTo<typeof Payment>;

  @column()
  public status: string;

  @column()
  public amount: number;

  @column()
  public failureCode?: string;

  @column()
  public failureMessage?: string;

  @column()
  public sellerMessage?: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
