import { DateTime } from 'luxon';
import {
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import Photo from 'App/Models/Photo';
import Meeting from 'App/Models/Meeting';
import Location from 'App/Models/Location';
import MeetroomAnswer from 'App/Models/MeetroomAnswer';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { RefundType } from 'Contracts/enums';
import { v4 as uuidv4 } from 'uuid';
export default class Meetroom extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public locationId: number;

  @column()
  public name: string;

  @column()
  public type: string;

  @column()
  public description: string;

  @column()
  public measureUnit: string;

  @column()
  public measureSize: number;

  @column()
  public measureOccupancy: number;

  @column()
  public rentalTimeframe: string;

  @column()
  public minimumRental: string;

  @column()
  public price: number;

  @column()
  public cancelationFull: number;

  @column()
  public cancelationHalf: number;

  @column()
  public cancelationNo: number;

  @column()
  public discountThree: number;

  @column()
  public discountHalf: number;

  @column()
  public discountFull: number;

  @column()
  public searchable: boolean;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @manyToMany(() => Photo, {
    pivotForeignKey: 'meetroom_id',
    pivotRelatedForeignKey: 'photo_id',
    pivotTable: 'meetroom_photos',
    pivotTimestamps: true
  })
  public photos: ManyToMany<typeof Photo>;

  @hasMany(() => Meeting)
  public meetings: HasMany<typeof Meeting>;

  @hasMany(() => MeetroomAnswer)
  public spaceRules: HasMany<typeof MeetroomAnswer>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public cowork_account_id: number;

  @column()
  public meetroom_local_account_id: number;

  @column()
  public slug: string;

  @column()
  public service_type: string;

  public calcPricePerHour(totalMinutes: number) {
    const TOTAL_DAY_MINUTES = 24 * 60;
    const HALF_DAY_MINUTES = 12 * 60;
    const THREE_HOURS_MINUTES = 3 * 60;
    let discount = 0;

    if (totalMinutes >= TOTAL_DAY_MINUTES) {
      discount = this.discountFull;
    } else if (totalMinutes >= HALF_DAY_MINUTES) {
      discount = this.discountHalf;
    } else if (totalMinutes >= THREE_HOURS_MINUTES) {
      discount = this.discountThree;
    }

    return this.price - this.price * (discount / 10000);
  }

  public calcRefund(dateMeeting: DateTime, dateBase: DateTime = DateTime.now()) {
    const totalHours = dateMeeting.diff(dateBase).as('hours');

    if (totalHours >= this.cancelationFull) {
      return RefundType.FULL_REFUND;
    } else if (totalHours >= this.cancelationHalf) {
      return RefundType.PARTIAL_REFUND;
    } else if (totalHours >= this.cancelationNo) {
      return RefundType.NO_REFUND;
    }

    return RefundType.FULL_REFUND;
  }

  @beforeCreate()
  public static async createUUID(model: Meetroom) {
    model.uuid = uuidv4();
  }
}
