import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeInvoiceItemServiceTypeNullables extends BaseSchema {
  protected tableName = 'invoice_items';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('service_type').nullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('service_type').notNullable().alter();
    });
  }
}
