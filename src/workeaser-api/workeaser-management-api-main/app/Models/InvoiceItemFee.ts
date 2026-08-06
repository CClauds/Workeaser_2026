import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import InvoiceItem from 'App/Models/InvoiceItem';
import InvoiceItemFeeTax from 'App/Models/InvoiceItemFeeTax';

export default class InvoiceItemFee extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public invoiceItemId: number;

  @belongsTo(() => InvoiceItem)
  public invoiceItem: BelongsTo<typeof InvoiceItem>;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public type: string;

  @column()
  public value: number;

  @column()
  public method: string;

  @column()
  public recurringType: string;

  @hasMany(() => InvoiceItemFeeTax)
  public taxes: HasMany<typeof InvoiceItemFeeTax>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
