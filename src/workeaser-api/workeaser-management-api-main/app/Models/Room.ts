import { DateTime } from 'luxon';
import {
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import Photo from 'App/Models/Photo';
import RoomFee from 'App/Models/RoomFee';
import Location from 'App/Models/Location';
import RoomPrice from 'App/Models/RoomPrice';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { v4 as uuidv4 } from 'uuid';
export default class Room extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public spaceSizeUnit: string;

  @column()
  public spaceSize: number;

  @column()
  public roomCapacity: number;

  @column()
  public renewalTax: number;

  @column()
  public shareable: boolean;

  @column()
  public searchable: boolean;

  @column()
  public dayPrice: number;

  @column()
  public is_daypass_enabled: boolean;

  @manyToMany(() => Photo, {
    pivotTable: 'room_photos'
  })
  public photos: ManyToMany<typeof Photo>;

  @hasMany(() => RoomPrice)
  public prices: HasMany<typeof RoomPrice>;

  @hasMany(() => RoomFee)
  public fees: HasMany<typeof RoomFee>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public cowork_account_id: number;

  @column()
  public room_local_account_id: number;

  @column()
  public slug: string;

  @column()
  public service_type: string;

  public static get fillable() {
    return [
      'location_id',
      'name',
      'description',
      'space_size_unit',
      'space_size',
      'room_capacity',
      'shareable',
      'searchable',
      'renewal_tax',
      'day_price',
      'is_daypass_enabled'
    ];
  }

  @beforeCreate()
  public static async createUUID(model: Room) {
    model.uuid = uuidv4();
  }
}
