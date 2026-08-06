import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPaymentIdInvoicePaymentHistories extends BaseSchema {
  protected tableName = 'invoice_payment_histories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('payment_id').notNullable().index().unsigned();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payment_id');
    });
  }
}
