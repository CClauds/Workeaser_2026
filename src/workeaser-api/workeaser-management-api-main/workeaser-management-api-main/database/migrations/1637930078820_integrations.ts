import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Integrations extends BaseSchema {
  protected tableName = 'integrations';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('client_account_id').unsigned().index();
      table.string('service').notNullable();
      table.string('token').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
