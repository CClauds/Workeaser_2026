import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import Service from 'App/Models/Service';
import { ServicesEnum } from 'Contracts/enums';

export default class ServiceSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name';
    await Service.updateOrCreateMany(uniqueKey, [
      {
        name: 'Virtual Office',
        slug: ServicesEnum.VIRTUAL_OFFICE,
        abbr: 'VO'
      },
      {
        name: 'Meeting Room',
        slug: ServicesEnum.MEETING_ROOM,
        abbr: 'MR'
      },
      {
        name: 'Open Desk',
        slug: ServicesEnum.OPEN_DESK,
        abbr: 'OD'
      },
      {
        name: 'Private Room',
        slug: ServicesEnum.PRIVATE_ROOM,
        abbr: 'PR'
      }
    ]);
  }
}
