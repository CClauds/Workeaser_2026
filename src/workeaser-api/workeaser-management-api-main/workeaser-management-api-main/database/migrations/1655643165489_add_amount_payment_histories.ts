import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddAmountPaymentHistories extends BaseSchema {
  protected tableName = 'payment_histories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('amount').defaultTo(0).notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('amount');
    });
  }
}
