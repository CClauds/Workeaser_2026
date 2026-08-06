import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class BankAccountTransactions extends BaseSchema {
  protected tableName = 'bank_account_transactions';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('linked_bank_account_id').index().notNullable();
      table.string('transaction_id').notNullable().index();
      table.timestamp('date', { useTz: true }).index();
      table.text('description');
      table.string('customer');
      table.string('category_plaid');
      table.string('category').nullable().index();
      table.integer('spent').nullable();
      table.integer('received').nullable();
      table.string('status').index();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
