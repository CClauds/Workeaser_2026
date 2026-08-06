import {
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkModule from 'App/Models/CoworkModule';
import Location from 'App/Models/Location';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class CoworkUser extends SoftDeleteBaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column()
  public uuid: string;

  @column({ serializeAs: null })
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column({ serializeAs: null })
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @manyToMany(() => CoworkModule, {
    pivotTable: 'cowork_user_modules'
  })
  public coworkModules: ManyToMany<typeof CoworkModule>;

  @manyToMany(() => Location, {
    pivotTable: 'employee_locations'
  })
  public employeeLocations: ManyToMany<typeof Location>;

  @column()
  public role: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static async generateUUID(model: CoworkUser) {
    model.uuid = uuidv4();
  }
}
