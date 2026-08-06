import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import VirtualOffice from 'App/Models/VirtualOffice';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class VirtualOfficeFee extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public virtualOfficeId: number;

  @belongsTo(() => VirtualOffice)
  public desk: BelongsTo<typeof VirtualOffice>;

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
