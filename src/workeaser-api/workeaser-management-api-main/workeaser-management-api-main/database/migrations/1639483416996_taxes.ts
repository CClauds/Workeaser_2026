import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Taxes extends BaseSchema {
  protected tableName = 'taxes';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().index();
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.string('method').notNullable();
      table.integer('value').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
