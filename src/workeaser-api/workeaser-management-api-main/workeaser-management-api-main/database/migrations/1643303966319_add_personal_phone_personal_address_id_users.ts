import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPersonalPhonePersonalAddressIdUsers extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('personal_phone').nullable().after('role');
      table.integer('personal_address_id').unsigned().index().after('personal_phone');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('personal_address_id');
      table.dropColumn('personal_phone');
    });
  }
}
