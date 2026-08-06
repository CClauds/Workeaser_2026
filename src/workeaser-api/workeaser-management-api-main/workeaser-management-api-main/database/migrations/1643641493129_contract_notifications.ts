import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ContractNotifications extends BaseSchema {
  protected tableName = 'contract_notifications';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('contract_id').unsigned().index().nullable();
      table.string('envelope_id');
      table.string('status');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
