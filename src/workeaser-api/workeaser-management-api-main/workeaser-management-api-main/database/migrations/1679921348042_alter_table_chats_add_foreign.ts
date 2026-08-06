import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CreateNewChatTables extends BaseSchema {
  protected tableName = 'chats';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cowork_account_id').unsigned().references('cowork_accounts.id').index();
      table.integer('client_account_id').unsigned().references('client_accounts.id').index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('cowork_account_id');
      table.dropForeign('client_account_id');
      table.dropColumn('cowork_account_id');
      table.dropColumn('client_account_id');
    });
  }
}
