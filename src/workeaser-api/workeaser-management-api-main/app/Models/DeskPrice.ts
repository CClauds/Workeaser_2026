import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import { ContractTermEnum } from 'Contracts/enums';
import Desk from 'App/Models/Desk';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class DeskPrice extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public deskId: number;

  @belongsTo(() => Desk)
  public desk: BelongsTo<typeof Desk>;

  @column()
  public duration: string;

  @column()
  public monthlyPrice: number;

  @column()
  public fullPrice: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public getDurationInDays(): number {
    switch (this.duration) {
      case ContractTermEnum.MONTH_1:
        return 30;
      case ContractTermEnum.MONTH_3:
        return 90;
      case ContractTermEnum.MONTH_6:
        return 180;
      case ContractTermEnum.YEAR_1:
        return 365;
      case ContractTermEnum.YEAR_2:
        return 730;
      case ContractTermEnum.YEAR_3:
        return 1095;
      default:
        return 0;
    }
  }
}
