import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UserEmailActivations extends BaseSchema {
  protected tableName = 'user_email_activations';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('user_id').unsigned().index();
      table.string('token').notNullable();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
