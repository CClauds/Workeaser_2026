import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Invoice from 'App/Models/Invoice';
import Payment from 'App/Models/Payment';
import InvoiceItem from 'App/Models/InvoiceItem';

export default class InvoicePaymentHistory extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public invoiceId: number;

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>;

  @column()
  public paymentId: number;

  @belongsTo(() => Payment)
  public payment: BelongsTo<typeof Payment>;

  @column()
  public invoiceItemId: number;

  @belongsTo(() => InvoiceItem)
  public invoiceItem: BelongsTo<typeof InvoiceItem>;

  @column()
  public amount: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
