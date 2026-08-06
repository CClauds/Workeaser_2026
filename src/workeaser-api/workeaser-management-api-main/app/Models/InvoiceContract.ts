import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Invoice from 'App/Models/Invoice';
import Contract from 'App/Models/Contract';

export default class InvoiceContract extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public invoiceId: number;

  @column()
  public contractId: number;

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>;

  @belongsTo(() => Contract)
  public contract: BelongsTo<typeof Contract>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
