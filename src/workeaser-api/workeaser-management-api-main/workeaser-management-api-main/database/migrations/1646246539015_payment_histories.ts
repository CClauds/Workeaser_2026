import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class PaymentHistories extends BaseSchema {
  protected tableName = 'payment_histories';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('payment_id').unsigned().notNullable().index();
      table.string('status').notNullable();
      table.string('failure_code').nullable();
      table.string('failure_message').nullable();
      table.string('seller_message').nullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
