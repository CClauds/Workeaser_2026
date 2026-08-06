import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class InvoiceItems extends BaseSchema {
  protected tableName = 'invoice_items';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('invoice_id').unsigned().index();
      table.string('service_type').notNullable();
      table.string('name').notNullable();
      table.date('date');
      table.text('description');
      table.integer('quantity');
      table.integer('unit_price');
      table.integer('unit_taxes');
      table.integer('total_taxes');
      table.integer('total_amount');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
