import { DateTime } from 'luxon';
import { column } from '@ioc:Adonis/Lucid/Orm';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class CoworkModule extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public slug: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
