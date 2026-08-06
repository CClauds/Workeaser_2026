import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Payments extends BaseSchema {
  protected tableName = 'payments';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('invoice_id').unsigned().notNullable().index();
      table.integer('user_id').unsigned().notNullable().index();
      table.string('payment_type').notNullable();
      table.string('integration_service').nullable();
      table.string('gateway_id').nullable();
      table.integer('amount').unsigned();
      table.string('status').notNullable();
      table.integer('card_id').unsigned().nullable().index();
      table.integer('bank_account_id').unsigned().nullable().index();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
