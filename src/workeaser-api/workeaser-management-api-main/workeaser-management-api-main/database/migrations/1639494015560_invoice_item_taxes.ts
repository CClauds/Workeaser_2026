import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class InvoiceItemTaxes extends BaseSchema {
  protected tableName = 'invoice_item_taxes';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('invoice_item_id').unsigned().index();
      table.integer('tax_id').unsigned().index();
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.integer('value');
      table.string('method').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
