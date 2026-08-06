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
import Location from 'App/Models/Location';
import VirtualOfficeFee from 'App/Models/VirtualOfficeFee';
import VirtualOfficePrice from 'App/Models/VirtualOfficePrice';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { v4 as uuidv4 } from 'uuid';
export default class VirtualOffice extends SoftDeleteBaseModel {
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
  public hasDirListing: boolean;

  @column()
  public hasMailing: boolean;

  @column()
  public hasPhoneAnswer: boolean;

  @column()
  public hasVoip: boolean;

  @column()
  public coworkingUsageMo: number;

  @column()
  public meetroomUsageMo: number;

  @column()
  public renewalTax: number;

  @column()
  public searchable: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @hasMany(() => VirtualOfficePrice)
  public prices: HasMany<typeof VirtualOfficePrice>;

  @hasMany(() => VirtualOfficeFee)
  public fees: HasMany<typeof VirtualOfficeFee>;

  @manyToMany(() => Photo, {
    pivotForeignKey: 'virtual_office_id',
    pivotRelatedForeignKey: 'photo_id',
    pivotTable: 'virtual_offices_photos',
    pivotTimestamps: true
  })
  public photos: ManyToMany<typeof Photo>;

  @column()
  public cowork_account_id: number;

  @column()
  public virt_office_local_account_id: number;

  @column()
  public slug: string;

  @column()
  public service_type: string;

  @beforeCreate()
  public static async createUUID(model: VirtualOffice) {
    model.uuid = uuidv4();
  }
}
