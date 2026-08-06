import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterClientAccountsAddCoworkAccountIds extends BaseSchema {
  protected tableName = 'client_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cowork_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cowork_account_id');
    });
  }
}
