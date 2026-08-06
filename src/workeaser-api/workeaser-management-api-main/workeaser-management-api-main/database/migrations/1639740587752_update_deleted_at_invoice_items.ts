import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UpdateDeletedAtInvoiceItems extends BaseSchema {
  protected tableName = 'update_deleted_at_invoice_items';

  public async up() {
    this.schema.alterTable('invoice_items', (table) => {
      table.timestamp('deleted_at', { useTz: true }).nullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable('invoice_items', (table) => {
      table.timestamp('deleted_at', { useTz: true }).notNullable().alter();
    });
  }
}
