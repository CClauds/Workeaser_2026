import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemovePersonalPhonePersonalAddressIdClientAccounts extends BaseSchema {
  protected tableName = 'client_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('personal_phone');
      table.dropColumn('personal_address_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('personal_address_id').unsigned().index();
      table.string('personal_phone').nullable();
    });
  }
}
