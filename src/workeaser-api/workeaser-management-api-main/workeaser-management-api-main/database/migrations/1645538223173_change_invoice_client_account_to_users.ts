import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeInvoiceClientAccountToUsers extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('client_account_id');
      table.integer('user_id').unsigned().index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('user_id');
      table.integer('client_account_id').unsigned().index();
    });
  }
}
