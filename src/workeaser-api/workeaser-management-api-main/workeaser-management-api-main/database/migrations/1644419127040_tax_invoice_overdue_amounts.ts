import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class TaxInvoiceOverdueAmounts extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('tax_invoice_overdue_amount').defaultTo(0).notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tax_invoice_overdue_amount');
    });
  }
}
