import { DateTime } from 'luxon';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class Note extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public chat_id: number;

  @column()
  public note: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  static get fillable() {
    return ['chat_id', 'note'];
  }
}
