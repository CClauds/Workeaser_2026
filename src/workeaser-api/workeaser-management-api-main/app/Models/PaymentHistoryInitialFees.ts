import { DateTime } from 'luxon';
import { belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Payment from './Payment';

export default class PaymentHistoryInitialFees extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public paymentId: number;

  @belongsTo(() => Payment)
  public payment: BelongsTo<typeof Payment>;

  @column()
  public amount: number;

  @column()
  public invoiceIniFeeId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
