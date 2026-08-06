import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class TotalTaxesOverdueAmountInvoiceItems extends BaseSchema {
  protected tableName = 'invoice_items';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('total_taxes_overdue').defaultTo(0).notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('total_taxes_overdue');
    });
  }
}
