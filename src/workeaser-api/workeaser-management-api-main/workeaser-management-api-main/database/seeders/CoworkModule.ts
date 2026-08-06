import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import CoworkModule from 'App/Models/CoworkModule';
import { CoworkModulesEnum } from 'Contracts/enums';

export default class CoworkModuleSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name';

    await CoworkModule.updateOrCreateMany(uniqueKey, [
      { name: 'Locations', slug: CoworkModulesEnum.LOCATIONS },
      { name: 'Services', slug: CoworkModulesEnum.SERVICES },
      { name: 'Relationship', slug: CoworkModulesEnum.RELATIONSHIP },
      { name: 'Finances', slug: CoworkModulesEnum.FINANCES },
      { name: 'Reports', slug: CoworkModulesEnum.REPORTS },
      { name: 'Account Settings', slug: CoworkModulesEnum.ACCOUNT_SETTINGS }
    ]);
  }
}
