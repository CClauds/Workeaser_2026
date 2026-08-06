import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddRecurringTypeInvoiceItemTaxes extends BaseSchema {
  protected tableName = 'invoice_item_taxes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('recurring_type').notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('recurring_type');
    });
  }
}
