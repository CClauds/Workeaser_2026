import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddFirstInvoiceAmountContracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('first_invoice_amount').unsigned().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('first_invoice_amount');
    });
  }
}
