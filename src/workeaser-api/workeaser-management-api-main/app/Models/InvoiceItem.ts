import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import Invoice from 'App/Models/Invoice';
import InvoiceItemFee from 'App/Models/InvoiceItemFee';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class InvoiceItem extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public invoiceId: number;

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>;

  @column.date()
  public date: DateTime;

  @column()
  public serviceType: string;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public quantity: number;

  @column()
  public unitPrice: number;

  @column()
  public totalTaxes: number;

  @column()
  public unitTaxes: number;

  @column()
  public unitTaxesOverdue: number;

  @column()
  public totalTaxesOverdue: number;

  @column()
  public totalAmount: number;

  @column()
  public resourceId: number;

  @hasMany(() => InvoiceItemFee)
  public fees: HasMany<typeof InvoiceItemFee>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
