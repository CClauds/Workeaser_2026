import { DateTime } from 'luxon';
import { column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';
import ClientAccount from './ClientAccount';
import ServiceType from './ServiceType';
import RoomsUnit from './RoomsUnit';
import Reseller from './Reseller';

/**
 * B2: Contrato-servicio.
 * Un cliente puede tener N service_contracts activos simultáneos,
 * cada uno con su propio canal de facturación (DIRECT o RESELLER).
 */
export default class ServiceContract extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public tenantId: number;

  @column()
  public clientAccountId: number;

  @column()
  public serviceTypeId: number;

  @column()
  public roomsUnitId: number | null;

  @column()
  public priceCents: number;

  @column()
  public billingChannel: 'DIRECT' | 'RESELLER';

  @column()
  public resellerId: number | null;

  @column.dateTime()
  public startedAt: DateTime;

  @column.dateTime()
  public endedAt: DateTime | null;

  @column()
  public status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => ClientAccount)
  public clientAccount: BelongsTo<typeof ClientAccount>;

  @belongsTo(() => ServiceType)
  public serviceType: BelongsTo<typeof ServiceType>;

  @belongsTo(() => RoomsUnit)
  public roomsUnit: BelongsTo<typeof RoomsUnit>;

  @belongsTo(() => Reseller)
  public reseller: BelongsTo<typeof Reseller>;
}
