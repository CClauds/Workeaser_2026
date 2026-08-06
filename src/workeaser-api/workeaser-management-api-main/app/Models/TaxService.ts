import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Tax from 'App/Models/Tax';
import Service from 'App/Models/Service';

export default class TaxService extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public taxId: number;

  @belongsTo(() => Tax)
  public tax: BelongsTo<typeof Tax>;

  @column()
  public serviceId: number;

  @belongsTo(() => Service)
  public service: BelongsTo<typeof Service>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
