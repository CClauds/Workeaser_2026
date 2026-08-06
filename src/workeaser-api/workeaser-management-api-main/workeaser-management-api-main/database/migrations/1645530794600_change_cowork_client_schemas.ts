import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeCoworkClientSchemas extends BaseSchema {
  protected tableName = 'cowork_clients';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().index();
      table.dropUnique(['cowork_account_id', 'client_account_id']);
      table.dropIndex('client_account_id');
      table.dropColumn('client_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('user_id');
      table.integer('client_account_id').unsigned().index();
    });
  }
}
