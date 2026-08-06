import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeInvoicePaymentHistoryNames extends BaseSchema {
  protected tableName = 'invoice_payment_histories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('invoice_item_id', 'invoice_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('invoice_id', 'invoice_item_id');
    });
  }
}
