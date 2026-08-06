import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Notifications extends BaseSchema {
  protected tableName = 'notifications';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('client_id').nullable().index();
      table.integer('cowork_account_id').nullable().index();
      table.string('type').index();
      table.string('title');
      table.string('message');
      table.boolean('read').notNullable().defaultTo(false);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
