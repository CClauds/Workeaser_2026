import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddIsFirstInvoiceCreatedContractRenewals extends BaseSchema {
  protected tableName = 'contract_renewals';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_first_invoice_created').defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_first_invoice_created');
    });
  }
}
