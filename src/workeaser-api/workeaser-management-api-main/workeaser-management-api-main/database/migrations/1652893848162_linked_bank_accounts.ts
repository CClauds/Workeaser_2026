import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class LinkedBankAccounts extends BaseSchema {
  protected tableName = 'linked_bank_accounts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().index();
      table.string('gateway_id').notNullable().index();
      table.string('integration_service').notNullable().index();
      table.string('nickname');
      table.string('holder_name');
      table.string('holder_type');
      table.string('bank_name');
      table.string('country');
      table.string('currency');
      table.string('last_digits');
      table.string('routing_number');
      table.boolean('is_main_account');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
