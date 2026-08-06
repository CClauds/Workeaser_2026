import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class BankAccounts extends BaseSchema {
  protected tableName = 'bank_accounts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('user_id').unsigned().index();
      table.string('gateway_id').notNullable();
      table.string('integration_service').notNullable().index();
      table.string('holder_name').notNullable();
      table.string('holder_type').notNullable();
      table.string('bank_name').notNullable();
      table.string('country');
      table.string('currency').notNullable();
      table.string('last_digits').notNullable();
      table.string('routing_number').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
