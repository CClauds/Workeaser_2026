import { DateTime } from 'luxon';
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Contract from 'App/Models/Contract';

export default class ContractActivity extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public contractId: number;

  @belongsTo(() => Contract)
  public invoice: BelongsTo<typeof Contract>;

  @column()
  public type: string;

  @column()
  public value?: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
