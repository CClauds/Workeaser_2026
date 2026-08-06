import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CoworkSettings extends BaseSchema {
  protected tableName = 'cowork_settings';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().index().nullable();
      table.integer('recurring_invoice_creation');
      table.integer('recurring_invoice_due_date');
      table.integer('contract_due_date');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
