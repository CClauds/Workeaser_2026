import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddDescriptionInvoiceItemFees extends BaseSchema {
  protected tableName = 'invoice_item_fees';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('description').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('description');
    });
  }
}
