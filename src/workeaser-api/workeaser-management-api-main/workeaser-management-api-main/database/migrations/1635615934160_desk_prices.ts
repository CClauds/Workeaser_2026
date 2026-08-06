import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class DeskPrices extends BaseSchema {
  protected tableName = 'desk_prices';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('desk_id').unsigned().index();
      table.integer('period');
      table.integer('price');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
