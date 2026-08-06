import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class InvoiceTags extends BaseSchema {
  protected tableName = 'invoice_tags';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('invoice_id').unsigned().index();
      table.integer('tag_invoice_id').unsigned().index();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
