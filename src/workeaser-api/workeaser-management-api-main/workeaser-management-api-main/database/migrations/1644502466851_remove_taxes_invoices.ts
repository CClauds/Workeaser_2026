import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveTaxesInvoices extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tax_id');
      table.dropColumn('tax_invoice_amount');
      table.dropColumn('tax_invoice_overdue_amount');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('tax_id').unsigned().index();
      table.integer('tax_invoice_amount');
      table.integer('tax_invoice_overdue_amount');
    });
  }
}
