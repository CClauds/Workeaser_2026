import { DateTime } from 'luxon';
import { column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm';
import Invoice from './Invoice';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class InitialFees extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public invoiceId: number;

  @column()
  public name: string;

  @column()
  public value: number;

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
