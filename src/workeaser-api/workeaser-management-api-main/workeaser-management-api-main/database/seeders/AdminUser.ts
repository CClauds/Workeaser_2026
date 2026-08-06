import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import User from 'App/Models/User';
import { UserRoleEnum } from 'Contracts/enums';

export default class AdminUserSeeder extends BaseSeeder {
  public async run() {
    await User.firstOrCreate(
      {
        email: 'admin@workeaser.com'
      },
      {
        firstName: 'Administrator',
        middleName: 'Amdin',
        lastName: 'Workeaser',
        email: 'admin@workeaser.com',
        emailConfirmed: true,
        password: 'secret',
        role: UserRoleEnum.ADMIN
      }
    );
  }
}
