import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import User from 'App/Models/User';
import Contract from 'App/Models/Contract';

export default class ContractUsage extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public contractId: number;

  @belongsTo(() => Contract)
  public contract: BelongsTo<typeof Contract>;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public serviceType: string;

  @column()
  public quantityCredits: number;

  @column()
  public resourceId: number;

  @column.dateTime()
  public bookingDate: DateTime;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
