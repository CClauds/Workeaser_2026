import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm';
import Service from 'App/Models/Service';
import CoworkAccount from 'App/Models/CoworkAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class Tax extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public coworkAccountId: number;

  @belongsTo(() => CoworkAccount)
  public coworkAccount: BelongsTo<typeof CoworkAccount>;

  @column()
  public name: string;

  @column()
  public type: string;

  @column()
  public recurringType: string;

  @column()
  public method: string;

  @column()
  public value: number;

  @manyToMany(() => Service, {
    pivotForeignKey: 'tax_id',
    pivotRelatedForeignKey: 'service_id',
    pivotTable: 'tax_services',
    pivotTimestamps: true
  })
  public services: ManyToMany<typeof Service>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
