import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveRecurringInvoiceMonths extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('recurring_invoice_month');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('recurring_invoice_month');
    });
  }
}
