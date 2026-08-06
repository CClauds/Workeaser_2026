import { DateTime } from 'luxon';
import { beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Location from 'App/Models/Location';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { v4 as uuidv4 } from 'uuid';
import User from './User';

export default class Tour extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column.dateTime()
  public dateStart: DateTime;

  @column.dateTime()
  public dateEnd: DateTime;

  @column()
  public status: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  static get fillable() {
    return ['location_id', 'date_start', 'date_end'];
  }

  @beforeCreate()
  public static async generateUUID(model: Tour) {
    model.uuid = uuidv4();
  }
}
