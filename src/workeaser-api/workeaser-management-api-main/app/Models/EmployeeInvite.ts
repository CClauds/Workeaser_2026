import {
  BaseModel,
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkModule from 'App/Models/CoworkModule';
import Location from 'App/Models/Location';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class EmployeeInvite extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public token: string;

  @column({ serializeAs: null })
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public email: string;

  @manyToMany(() => Location, {
    pivotTable: 'employee_invite_locations'
  })
  public locations: ManyToMany<typeof Location>;

  @manyToMany(() => CoworkModule, {
    pivotTable: 'employee_invite_capabilities'
  })
  public capabilities: ManyToMany<typeof CoworkModule>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public invitee_first_name: string;

  static get fillable() {
    return ['email', 'invitee_first_name'];
  }

  @beforeCreate()
  public static async generateUUID(model: EmployeeInvite) {
    model.uuid = uuidv4();
  }
}
