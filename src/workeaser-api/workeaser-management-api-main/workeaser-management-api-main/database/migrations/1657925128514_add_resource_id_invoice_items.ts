import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddResourceIdInvoiceItem extends BaseSchema {
  protected tableName = 'invoice_items';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('resource_id').index().nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('resource_id');
    });
  }
}
