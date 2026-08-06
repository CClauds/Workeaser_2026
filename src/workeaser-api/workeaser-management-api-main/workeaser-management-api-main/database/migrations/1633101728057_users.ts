import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { UserRoleEnum } from 'Contracts/enums';

export default class Users extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.string('first_name', 255).notNullable();
      table.string('last_name', 255).notNullable();
      table.string('email', 255).notNullable().index();
      table.string('password', 255).notNullable();
      table.boolean('email_confirmed').defaultTo(false);
      table.string('role').defaultTo(UserRoleEnum.CLIENT);

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
