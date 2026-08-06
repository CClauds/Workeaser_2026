import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class TaxServices extends BaseSchema {
  protected tableName = 'tax_services';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('tax_id').unsigned().index();
      table.integer('service_id').unsigned().index();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
