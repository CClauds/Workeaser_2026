import { DateTime } from 'luxon';
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Meeting from 'App/Models/Meeting';

export default class MeetingTax extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public meetingId: number;

  @belongsTo(() => Meeting)
  public meeting: BelongsTo<typeof Meeting>;

  @column()
  public name: string;

  @column()
  public type: string;

  @column()
  public value: number;

  @column()
  public method: string;

  @column()
  public recurringType: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
