import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import CoworkUser from './CoworkUser';
import CoworkModule from './CoworkModule';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class CoworkUserModule extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkUserId: number;

  @belongsTo(() => CoworkUser)
  public coworkUser: BelongsTo<typeof CoworkUser>;

  @column()
  public coworkModuleId: number;

  @belongsTo(() => CoworkModule)
  public coworkModule: BelongsTo<typeof CoworkModule>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
