import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterToursRenameClientAccountIds extends BaseSchema {
  protected tableName = 'tours';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('client_account_id', 'user_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('user_id', 'client_account_id');
    });
  }
}
