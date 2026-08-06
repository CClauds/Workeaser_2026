import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddUuidInvoices extends BaseSchema {
  protected tableName = 'invoices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('uuid').index().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uuid');
    });
  }
}
