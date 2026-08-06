import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddApplicationFeeInvoices extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('application_fee').defaultTo(0);
      table.boolean('application_fee_paid').defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('application_fee');
      table.dropColumn('application_fee_paid');
    });
  }
}
