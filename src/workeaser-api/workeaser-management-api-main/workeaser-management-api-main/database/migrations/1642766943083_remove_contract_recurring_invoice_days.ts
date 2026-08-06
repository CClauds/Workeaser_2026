import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveContractRecurringInvoiceDays extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('recurring_invoice_day');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('recurring_invoice_day');
    });
  }
}
