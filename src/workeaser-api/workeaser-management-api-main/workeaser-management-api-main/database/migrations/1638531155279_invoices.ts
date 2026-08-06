import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Invoices extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().index();
      table.integer('client_account_id').unsigned().index();
      table.integer('location_id').unsigned().index();
      table.date('date');
      table.date('due_date');
      table.string('terms');
      table.text('additional_notes');
      table.integer('subtotal');
      table.integer('tax_id').unsigned().index;
      table.integer('total');
      table.integer('total_taxes');
      table.integer('tax_invoice_amount');
      table.string('status');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
