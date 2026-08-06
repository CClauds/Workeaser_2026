import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class VirtualOfficesPrices extends BaseSchema {
  protected tableName = 'virtual_offices_prices';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('virtual_office_id').unsigned().index();
      table.integer('duration');
      table.integer('monthly_price');
      table.integer('full_price');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
