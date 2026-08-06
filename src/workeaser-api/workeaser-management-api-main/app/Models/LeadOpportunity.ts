import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Lead from 'App/Models/Lead';
import Service from 'App/Models/Service';
import { DateTime } from 'luxon';

export default class LeadOpportunity extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public leadId: number;

  @belongsTo(() => Lead)
  public lead: BelongsTo<typeof Lead>;

  @column()
  public serviceId: number;

  @belongsTo(() => Service)
  public service: BelongsTo<typeof Service>;

  @column()
  public status: string;

  @column()
  public notes: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
