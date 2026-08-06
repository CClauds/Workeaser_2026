import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import ClientModule from 'App/Models/ClientModule';
import { ClientModulesEnum } from 'Contracts/enums';

export default class ClientModuleSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name';

    await ClientModule.updateOrCreateMany(uniqueKey, [
      { name: 'Benefits Overview', slug: ClientModulesEnum.BENEFITS_OVERVIEW },
      {
        name: 'Products & Services',
        slug: ClientModulesEnum.PRODUCTS_SERVICES
      },
      { name: 'Booking Schedule', slug: ClientModulesEnum.BOOKING_SCHEDULE },
      { name: 'Mailbox Manager', slug: ClientModulesEnum.MAILBOX_MANAGER },
      { name: 'Payment & Invoices', slug: ClientModulesEnum.PAYMENT_INVOICES },
      { name: 'Space Support', slug: ClientModulesEnum.SPACE_SUPPORT }
    ]);
  }
}
