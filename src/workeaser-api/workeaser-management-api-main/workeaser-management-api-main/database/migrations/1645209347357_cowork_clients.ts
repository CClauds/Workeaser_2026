import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CoworkClients extends BaseSchema {
  protected tableName = 'cowork_clients';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().index();
      table.integer('client_account_id').unsigned().index();
      table.unique(['cowork_account_id', 'client_account_id']);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
