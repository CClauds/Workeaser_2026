import {
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import CoworkStripeAccount from 'App/Models/CoworkStripeAccount';
import Photo from 'App/Models/Photo';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class CoworkAccount extends SoftDeleteBaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public name: string;

  @column()
  public email: string | null;

  @column()
  public phone: string | null;

  @column({ serializeAs: null })
  public photoId: number | null;

  @belongsTo(() => Photo)
  public photo: BelongsTo<typeof Photo>;

  @manyToMany(() => User, {
    pivotForeignKey: 'cowork_id',
    pivotRelatedForeignKey: 'user_id',
    pivotTable: 'coworks_users',
    pivotColumns: ['role'],
    pivotTimestamps: true
  })
  public users: ManyToMany<typeof User>;

  @hasOne(() => CoworkStripeAccount)
  public stripeAccount: HasOne<typeof CoworkStripeAccount>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static async generateUUID(model: CoworkAccount) {
    model.uuid = uuidv4();
  }
}
