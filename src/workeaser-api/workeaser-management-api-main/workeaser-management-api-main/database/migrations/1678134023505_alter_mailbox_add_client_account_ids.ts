import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMailboxAddClientAccountIds extends BaseSchema {
  protected tableName = 'mailboxes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('client_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('client_account_id');
    });
  }
}
