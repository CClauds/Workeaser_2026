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
import DeskFee from 'App/Models/DeskFee';
import Location from 'App/Models/Location';
import DeskPrice from 'App/Models/DeskPrice';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { v4 as uuidv4 } from 'uuid';
export default class Desk extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public uuid: string;

  @column()
  public locationId: number;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public shareable: boolean;

  @column()
  public searchable: boolean;

  @column()
  public quantity: number;

  @column()
  public renewalTax: number;

  @column()
  public dayPrice: number;

  @column()
  public minimum_rental_period: number;

  @column()
  public is_daypass_enabled: boolean;

  @manyToMany(() => Photo, {
    pivotTable: 'desk_photos'
  })
  public photos: ManyToMany<typeof Photo>;

  @hasMany(() => DeskPrice)
  public prices: HasMany<typeof DeskPrice>;

  @hasMany(() => DeskFee)
  public fees: HasMany<typeof DeskFee>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column()
  public cowork_account_id: number;

  @column()
  public desk_local_account_id: number;

  @column()
  public slug: string;

  @column()
  public service_type: string;

  public static get fillable() {
    return [
      'location_id',
      'name',
      'description',
      'shareable',
      'quantity',
      'minimum_rental_period',
      'searchable',
      'renewal_tax',
      'day_price',
      'is_daypass_enabled'
    ];
  }

  @beforeCreate()
  public static async createUUID(model: Desk) {
    model.uuid = uuidv4();
  }
}
