import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Contract from 'App/Models/Contract';

export default class ContractRenewal extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public contractId: number;

  @belongsTo(() => Contract)
  public contract: BelongsTo<typeof Contract>;

  @column.date()
  public dateStart: DateTime;

  @column.date()
  public dateEnd: DateTime;

  @column()
  public termSize: string;

  @column()
  public amount: number;

  @column()
  public hasRenewalAdjustment: boolean;

  @column()
  public isFirstInvoiceCreated: boolean;

  @column()
  public generatedInvoice: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
