import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Chats extends BaseSchema {
  protected tableName = 'chats';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('cowork_user_id').notNullable();
      table.integer('client_user_id').notNullable();
      //table.text('message').notNullable();

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
