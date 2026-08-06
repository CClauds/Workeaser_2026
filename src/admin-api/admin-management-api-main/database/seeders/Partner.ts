import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Partner from 'App/Models/Partner'
import { PartnerRoleEnum } from 'Contracts/enums'

export default class extends BaseSeeder {
  public async run() {
    const existing = await Partner.findBy('email', 'testing@mail.com')
    if (existing) return

    await Partner.create({
      firstName: 'Test',
      lastName: 'Account',
      email: 'testing@mail.com',
      password: '12345678',
      role: PartnerRoleEnum.SYSTEM_DIRECTOR,
    })
  }
}
