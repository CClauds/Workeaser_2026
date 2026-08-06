import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UserIntegrations extends BaseSchema {
  protected tableName = 'user_integrations';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('user_id').unsigned().index();
      table.string('service').notNullable();
      table.string('key').notNullable();
      table.string('value').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
