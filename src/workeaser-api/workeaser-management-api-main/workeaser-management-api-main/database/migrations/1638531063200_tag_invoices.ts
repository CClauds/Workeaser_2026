import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class TagInvoices extends BaseSchema {
  protected tableName = 'tag_invoices';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
