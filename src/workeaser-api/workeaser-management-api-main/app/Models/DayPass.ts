import { DateTime } from 'luxon';
import {
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany
} from '@ioc:Adonis/Lucid/Orm';
import User from 'App/Models/User';
import Lead from 'App/Models/Lead';
import Invoice from 'App/Models/Invoice';
import Location from 'App/Models/Location';
import CoworkAccount from 'App/Models/CoworkAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import DayPassTax from 'App/Models/DayPassTax';
import { v4 as uuidv4 } from 'uuid';

export default class DayPass extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public userType: string;

  @column()
  public leadId: number;

  @belongsTo(() => Lead)
  public lead: BelongsTo<typeof Lead>;

  @column()
  public clientId: number;

  @belongsTo(() => User, { foreignKey: 'clientId' })
  public client: BelongsTo<typeof User>;

  @column()
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column.date()
  public date: DateTime;

  @column()
  public status: string;

  @column()
  public space: string;

  @column()
  public paymentMethod: string;

  @column()
  public solicitedBy: string;

  @column()
  public invoiceId: number;

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>;

  @column()
  public resourceId: number;

  @column()
  public priceCharged: number;

  @hasMany(() => DayPassTax)
  public taxes: HasMany<typeof DayPassTax>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public paid_amount: number;

  @column()
  public residual_amount: number;

  static get fillable() {
    return [
      'user_type',
      'client_id',
      'lead_id',
      'payment_method',
      'location_id',
      'resource_id',
      'date',
      'space'
    ];
  }

  @beforeCreate()
  public static async generateUUID(model: DayPass) {
    model.uuid = uuidv4();
  }
}
