import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Messages extends BaseSchema {
  protected tableName = 'messages';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('from_user_id').notNullable();
      table.integer('to_user_id').notNullable();
      table.text('message').notNullable();

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
