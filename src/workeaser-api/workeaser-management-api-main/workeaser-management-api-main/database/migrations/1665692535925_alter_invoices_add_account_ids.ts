import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterInvoicesAddAccountIds extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('invoice_local_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('invoice_local_account_id');
    });
  }
}
