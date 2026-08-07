import { DateTime } from 'luxon';
import { column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import RoomsUnit from './RoomsUnit';

export default class ServiceType extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public tenantId: number;

  @column()
  public name: string;

  @column()
  public slug: string;

  @column()
  public description: string | null;

  @column()
  public pricingLogic: 'RECURRING' | 'HOURLY' | 'ON_DEMAND';

  @column()
  public isActive: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => RoomsUnit)
  public roomsUnits: HasMany<typeof RoomsUnit>;
}
