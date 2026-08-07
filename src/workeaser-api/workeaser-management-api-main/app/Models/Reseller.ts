import { DateTime } from 'luxon';
import { column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import ServiceContract from './ServiceContract';

export default class Reseller extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public tenantId: number;

  @column()
  public name: string;

  @column()
  public slug: string;

  @column()
  public contactName: string | null;

  @column()
  public contactEmail: string | null;

  @column()
  public contactPhone: string | null;

  @column()
  public commissionBps: number;

  @column()
  public notes: string | null;

  @column()
  public isActive: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => ServiceContract)
  public serviceContracts: HasMany<typeof ServiceContract>;
}
