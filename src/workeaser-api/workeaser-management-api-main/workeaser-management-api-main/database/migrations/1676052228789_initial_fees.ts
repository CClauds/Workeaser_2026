import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class InitialFees extends BaseSchema {
  protected tableName = 'initial_fees';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('invoice_id').unsigned().index();
      table.string('name');
      table.integer('value');
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
