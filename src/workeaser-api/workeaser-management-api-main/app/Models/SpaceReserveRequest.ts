import Location from 'App/Models/Location';
import ClientAccount from 'App/Models/ClientAccount';
import CoworkAccount from 'App/Models/CoworkAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';

export default class SpaceReserveRequest extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public clientAccountId: number;

  @belongsTo(() => ClientAccount)
  public clientAccount: BelongsTo<typeof ClientAccount>;

  @column()
  public locationId: number;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @column()
  public serviceType: string;

  @column()
  public resourceId: number;

  @column()
  public inquireType: string;

  @column()
  public potentialEarnings: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column.dateTime()
  public requested_date: DateTime;

  @column()
  public initial_payment: number;

  @column()
  public term_size: string;

  @column()
  public contract_recurring: string;

  @column()
  public auto_renew: string;

  @column()
  public requested_service: string;

  @column()
  public location_name: string;
}
