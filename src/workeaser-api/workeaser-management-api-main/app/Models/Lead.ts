import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import CoworkAccount from 'App/Models/CoworkAccount';
import ClientAccount from 'App/Models/ClientAccount';
import LeadOpportunity from 'App/Models/LeadOpportunity';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class Lead extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public clientAccountId: number;

  @belongsTo(() => ClientAccount)
  public clientAccount: BelongsTo<typeof ClientAccount>;

  @column.dateTime()
  public lastContact: DateTime;

  @hasMany(() => LeadOpportunity)
  public opportunities: HasMany<typeof LeadOpportunity>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public lead_local_account_id: number;
}
