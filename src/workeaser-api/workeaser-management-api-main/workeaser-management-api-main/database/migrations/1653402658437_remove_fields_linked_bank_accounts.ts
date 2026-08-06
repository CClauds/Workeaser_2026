import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveFieldsLinkedBankAccounts extends BaseSchema {
  protected tableName = 'linked_bank_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('holder_name');
      table.dropColumn('holder_type');
      table.dropColumn('country');
      table.dropColumn('currency');
      table.dropColumn('routing_number');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('holder_name');
      table.string('holder_type');
      table.string('country');
      table.string('currency');
      table.string('routing_number');
    });
  }
}
