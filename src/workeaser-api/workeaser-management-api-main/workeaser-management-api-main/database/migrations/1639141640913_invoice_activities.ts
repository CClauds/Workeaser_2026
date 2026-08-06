import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class InvoiceActivities extends BaseSchema {
  protected tableName = 'invoice_activities';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('invoice_id').unsigned().index();
      table.string('type').notNullable();
      table.string('value').nullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
