import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterClientAccountsAddAccountIds extends BaseSchema {
  protected tableName = 'client_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('client_acc_local_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('client_acc_local_account_id');
    });
  }
}
