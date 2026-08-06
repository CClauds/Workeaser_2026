import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class Video extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public file: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public get getVideoUrl() {
    return `${Env.get('API_URL')}/videos/${this.file}`;
  }
}
