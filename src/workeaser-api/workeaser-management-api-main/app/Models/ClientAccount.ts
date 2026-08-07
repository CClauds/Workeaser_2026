import {
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  HasMany,
  hasMany,
  hasOne,
  HasOne,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import Address from 'App/Models/Address';
import ClientModule from 'App/Models/ClientModule';
import Invoice from 'App/Models/Invoice';
import Photo from 'App/Models/Photo';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import ServiceContract from 'App/Models/ServiceContract';
import Team from 'App/Models/Team';
import TeamMember from 'App/Models/TeamMember';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export default class ClientAccount extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  // B2: multi-tenant foundation
  @column()
  public tenantId: number;

  @column()
  public uuid: string;

  @column({ serializeAs: null })
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public companyName: string | null;

  @column()
  public companyEmail: string | null;

  @column()
  public companyPhone: string | null;

  // B2: contact fields (separate from linked user)
  @column()
  public contactFirstName: string | null;

  @column()
  public contactLastName: string | null;

  @column()
  public contactEmail: string | null;

  @column()
  public contactPhone: string | null;

  // B2: Private Mailbox number
  @column()
  public pmbNumber: string | null;

  @column()
  public companyAddressId: number | null;

  @belongsTo(() => Address, { foreignKey: 'companyAddressId' })
  public companyAddress: BelongsTo<typeof Address>;

  @column()
  public companyPhotoId: number | null;

  @belongsTo(() => Photo, { foreignKey: 'companyPhotoId' })
  public companyPhoto: BelongsTo<typeof Photo>;

  @manyToMany(() => ClientModule, {
    pivotTable: 'client_account_modules'
  })
  public clientModules: ManyToMany<typeof ClientModule>;

  @hasMany(() => Invoice)
  public invoices: HasMany<typeof Invoice>;

  @hasOne(() => Team)
  public team: HasOne<typeof Team>;

  @hasMany(() => TeamMember)
  public teamsMember: HasMany<typeof TeamMember>;

  // B2: service contracts (one client can have multiple active services)
  @hasMany(() => ServiceContract)
  public serviceContracts: HasMany<typeof ServiceContract>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  cowork_account_id: number;

  @column()
  client_acc_local_account_id: number;

  @beforeCreate()
  public static async generateUUID(model: ClientAccount) {
    model.uuid = uuidv4();
  }
}
