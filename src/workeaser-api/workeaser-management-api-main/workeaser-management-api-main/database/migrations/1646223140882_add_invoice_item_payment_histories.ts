import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddInvoiceItemPaymentHistories extends BaseSchema {
  protected tableName = 'invoice_payment_histories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('invoice_item_id').unsigned().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('invoice_item_id');
    });
  }
}
