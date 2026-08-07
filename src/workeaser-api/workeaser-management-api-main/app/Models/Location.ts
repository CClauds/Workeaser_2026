import { DateTime } from 'luxon';
import {
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import Tour from 'App/Models/Tour';
import Desk from 'App/Models/Desk';
import User from 'App/Models/User';
import Room from 'App/Models/Room';
import Photo from 'App/Models/Photo';
import Address from 'App/Models/Address';
import Service from 'App/Models/Service';
import Amenity from 'App/Models/Amenity';
import Meeting from 'App/Models/Meeting';
import DayPass from 'App/Models/DayPass';
import RoomsUnit from 'App/Models/RoomsUnit';
import ServiceContract from 'App/Models/ServiceContract';
import Meetroom from 'App/Models/Meetroom';
import CoworkUser from 'App/Models/CoworkUser';
import VirtualOffice from 'App/Models/VirtualOffice';
import CoworkAccount from 'App/Models/CoworkAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { CoworkUserRoleEnum } from 'Contracts/enums';

export default class Location extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  // B2: multi-tenant foundation
  @column()
  public tenantId: number;

  @column({ serializeAs: null })
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public name: string;

  @column()
  public phone: string;

  @column()
  public email: string;

  @column()
  public description: string;

  @column()
  public addressId: number;

  @belongsTo(() => Address)
  public address: BelongsTo<typeof Address>;

  @manyToMany(() => Photo, {
    pivotTable: 'location_photos'
  })
  public photos: ManyToMany<typeof Photo>;

  @manyToMany(() => Service, {
    pivotTable: 'location_services'
  })
  public services: ManyToMany<typeof Service>;

  @manyToMany(() => Amenity, {
    pivotTable: 'location_amenities'
  })
  public amenities: ManyToMany<typeof Amenity>;

  @hasMany(() => Desk)
  public desks: HasMany<typeof Desk>;

  @hasMany(() => Room)
  public rooms: HasMany<typeof Room>;

  @hasMany(() => Meetroom)
  public meetrooms: HasMany<typeof Meetroom>;

  @hasMany(() => VirtualOffice)
  public virtualOffices: HasMany<typeof VirtualOffice>;

  @hasMany(() => Meeting)
  public meetings: HasMany<typeof Meeting>;

  @hasMany(() => DayPass)
  public dayPasses: HasMany<typeof DayPass>;

  @hasMany(() => Tour)
  public tours: HasMany<typeof Tour>;

  // B2 relations
  @hasMany(() => RoomsUnit)
  public roomsUnits: HasMany<typeof RoomsUnit>;

  @hasMany(() => ServiceContract)
  public serviceContracts: HasMany<typeof ServiceContract>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public location_account_id: number;

  static get fillable() {
    return ['name', 'description', 'email', 'password', 'phone'];
  }

  public async getSpaceHost() {
    const managerCowork = await CoworkUser.query()
      .where('cowork_account_id', this.coworkAccountId)
      .where('role', CoworkUserRoleEnum.MANAGER)
      .firstOrFail();

    const managerCoworkingUser = await User.findOrFail(managerCowork.userId);
    await managerCoworkingUser.load('photo');

    return managerCoworkingUser;
  }
}
