import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class PaymentHistoryInitialFees extends BaseSchema {
  protected tableName = 'payment_history_initial_fees';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('payment_id').unsigned().index();
      table.integer('invoice_ini_fee_id').unsigned().index();
      table.integer('amount');
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
