import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class BankAccountHolderTypeNullables extends BaseSchema {
  protected tableName = 'bank_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('holder_type').nullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('holder_type').notNullable().alter();
    });
  }
}
