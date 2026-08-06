import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveInvoiceTerms extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('terms');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('terms').nullable();
    });
  }
}
