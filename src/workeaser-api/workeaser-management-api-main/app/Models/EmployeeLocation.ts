import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Location from 'App/Models/Location';
import CoworkUser from 'App/Models/CoworkUser';

export default class EmployeeLocation extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkUserId: number;

  @belongsTo(() => CoworkUser)
  public coworkUser: BelongsTo<typeof CoworkUser>;

  @column({ columnName: 'location_id' })
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
