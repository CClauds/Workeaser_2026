import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveTaxIdInvoiceItemTaxes extends BaseSchema {
  protected tableName = 'invoice_item_taxes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('tax_id');
      table.dropColumn('tax_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('tax_id').unsigned().index();
    });
  }
}
