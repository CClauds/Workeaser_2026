import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeInvoiceItemTaxToInvoiceItemFees extends BaseSchema {
  protected oldTableName = 'invoice_item_taxes';
  protected newTableName = 'invoice_item_fees';

  public async up() {
    this.schema.renameTable(this.oldTableName, this.newTableName);
  }

  public async down() {
    this.schema.renameTable(this.newTableName, this.oldTableName);
  }
}
