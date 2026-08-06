import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Meeting from 'App/Models/Meeting';

export default class MeetingBilling extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public meetingId: number;

  @belongsTo(() => Meeting)
  public meeting: BelongsTo<typeof Meeting>;

  @column()
  public quantityMinutes: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
