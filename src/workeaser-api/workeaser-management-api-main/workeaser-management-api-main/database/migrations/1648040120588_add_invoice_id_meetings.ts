import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddInvoiceIdMeetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('invoice_id').unsigned().nullable().index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('invoice_id');
    });
  }
}
