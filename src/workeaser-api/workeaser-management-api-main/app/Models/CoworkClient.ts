import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import CoworkAccount from 'App/Models/CoworkAccount';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class CoworkClient extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column()
  public uuid: string;

  @column({ serializeAs: null })
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column({ serializeAs: null })
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static async generateUUID(model: CoworkClient) {
    model.uuid = uuidv4();
  }
}
