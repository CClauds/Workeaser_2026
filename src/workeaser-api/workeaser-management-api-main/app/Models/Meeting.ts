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
import Invoice from 'App/Models/Invoice';
import Meetroom from 'App/Models/Meetroom';
import Location from 'App/Models/Location';
import MeetingTax from 'App/Models/MeetingTax';
import CoworkAccount from 'App/Models/CoworkAccount';
import MeetingBilling from 'App/Models/MeetingBilling';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { v4 as uuidv4 } from 'uuid';

export default class Meeting extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column()
  public meetroomId: number;

  @belongsTo(() => Meetroom)
  public meetroom: BelongsTo<typeof Meetroom>;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public invoiceId?: number;

  @belongsTo(() => Invoice)
  public invoice: BelongsTo<typeof Invoice>;

  @column()
  public discountType: string;

  @column()
  public discountValue: number;

  @column()
  public quantityMinutes: number;

  @column()
  public pricePerHour: number;

  @column()
  public amountDiscount: number;

  @column.dateTime()
  public dateStart: DateTime;

  @column.dateTime()
  public dateEnd: DateTime;

  @column()
  public costHours: number;

  @column()
  public additionalInformation?: string;

  @column()
  public status: string;

  @column()
  public paymentMethod: string;

  @column()
  public solicitedBy: string;

  @hasMany(() => MeetingTax)
  public taxes: HasMany<typeof MeetingTax>;

  @hasMany(() => MeetingBilling)
  public billings: HasMany<typeof MeetingBilling>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static async generateUUID(model: Meeting) {
    model.uuid = uuidv4();
  }
}
