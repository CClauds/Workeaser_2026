import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddGeneratedInvoiceFieldContractRenewals extends BaseSchema {
  protected tableName = 'contract_renewals';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('generated_invoice').defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('generated_invoice');
    });
  }
}
