import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Desk from 'App/Models/Desk';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class DeskFee extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public deskId: number;

  @belongsTo(() => Desk)
  public desk: BelongsTo<typeof Desk>;

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public amount: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
