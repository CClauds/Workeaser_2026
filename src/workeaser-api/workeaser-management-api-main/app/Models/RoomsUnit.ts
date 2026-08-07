import { DateTime } from 'luxon';
import { column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import Location from './Location';
import ServiceType from './ServiceType';

export default class RoomsUnit extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public tenantId: number;

  @column()
  public locationId: number;

  @column()
  public serviceTypeId: number;

  @column()
  public roomNumber: string;

  @column()
  public displayName: string;

  @column()
  public description: string | null;

  @column()
  public sizeSqft: number | null;

  @column()
  public capacity: number | null;

  @column()
  public basePriceCents: number;

  @column()
  public isActive: boolean;

  @column()
  public isAvailable: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => Location)
  public location: BelongsTo<typeof Location>;

  @belongsTo(() => ServiceType)
  public serviceType: BelongsTo<typeof ServiceType>;
}
