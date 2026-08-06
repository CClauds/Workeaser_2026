import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class InvoicePaymentHistories extends BaseSchema {
  protected tableName = 'invoice_payment_histories';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('invoice_item_id').unsigned().index();
      table.integer('amount').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
