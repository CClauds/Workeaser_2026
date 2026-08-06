import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeLocationIdInvoiceNullables extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('location_id').unsigned().nullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('location_id').unsigned().index().alter();
    });
  }
}
