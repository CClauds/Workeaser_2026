import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CoworkUserModules extends BaseSchema {
  protected tableName = 'cowork_user_modules';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('cowork_user_id').unsigned().index();
      table.integer('cowork_module_id').unsigned().index();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
