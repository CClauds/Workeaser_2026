import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterColumnAddForeignKeyToLeads extends BaseSchema {
  protected tableName = 'leads';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('cowork_account_id').references('users.id');
      table.foreign('client_account_id').references('users.id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('cowork_account_id');
      table.dropForeign('client_account_id');
    });
  }
}
