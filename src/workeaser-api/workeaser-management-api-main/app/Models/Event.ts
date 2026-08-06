import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import CalendarIntegration from 'App/Models/CalendarIntegration';

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public calendarIntegrationId: number;

  @belongsTo(() => CalendarIntegration)
  public calendarIntegration: BelongsTo<typeof CalendarIntegration>;

  @column()
  public eventId: string;

  @column()
  public bookingType: string;

  @column()
  public resourceId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
