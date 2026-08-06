import { DateTime } from 'luxon';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';
import { ServicesEnum } from 'Contracts/enums';

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public slug: string;

  @column()
  public abbr: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  public static formatServiceName(service: string) {
    switch (service) {
      case ServicesEnum.MEETING_ROOM:
        return 'Meeting Room';
      case ServicesEnum.OPEN_DESK:
        return 'Open Desk';
      case ServicesEnum.PRIVATE_ROOM:
        return 'Private Room';
      case ServicesEnum.VIRTUAL_OFFICE:
        return 'Virtual Office';
      default:
        return '';
    }
  }
}
