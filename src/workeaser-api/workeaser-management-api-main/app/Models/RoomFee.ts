import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Room from 'App/Models/Room';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class RoomFee extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public roomId: number;

  @belongsTo(() => Room)
  public room: BelongsTo<typeof Room>;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public amount: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
