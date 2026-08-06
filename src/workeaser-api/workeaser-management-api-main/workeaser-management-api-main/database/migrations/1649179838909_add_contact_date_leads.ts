import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddContactDateLeads extends BaseSchema {
  protected tableName = 'leads';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('last_contact', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_contact');
    });
  }
}
