import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Contract from 'App/Models/Contract';

export default class ContractNotification extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public contractId: number;

  @belongsTo(() => Contract)
  public contract: BelongsTo<typeof Contract>;

  @column()
  public envelopeId: string;

  @column()
  public status: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
