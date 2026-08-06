import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import User from 'App/Models/User';
import CoworkAccount from 'App/Models/CoworkAccount';

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public clientId: number;

  @belongsTo(() => User, { foreignKey: 'clientId' })
  public client: BelongsTo<typeof User>;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public type: string;

  @column()
  public title: string;

  @column()
  public message: string;

  @column()
  public read: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
