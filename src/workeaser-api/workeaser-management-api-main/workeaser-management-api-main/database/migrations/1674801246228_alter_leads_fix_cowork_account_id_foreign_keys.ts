import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterLeadsFixCoworkAccountIdForeignKeys extends BaseSchema {
  protected tableName = 'leads';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('cowork_account_id');
      table.dropForeign('client_account_id');
    });
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.foreign('cowork_account_id').references('users.id');
      table.foreign('client_account_id').references('users.id');
    });
  }
}
