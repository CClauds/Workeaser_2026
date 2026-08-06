import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Locations extends BaseSchema {
  protected tableName = 'locations';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('cowork_account_id').unsigned().index();
      table.string('name').notNullable();
      table.text('description').notNullable();
      table.integer('address_id').unsigned().index();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
