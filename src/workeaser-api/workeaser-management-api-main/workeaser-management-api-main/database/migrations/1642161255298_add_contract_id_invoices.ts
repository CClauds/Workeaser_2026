import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddContractIdInvoices extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('contract_id').unsigned().index().nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('contract_id');
    });
  }
}
