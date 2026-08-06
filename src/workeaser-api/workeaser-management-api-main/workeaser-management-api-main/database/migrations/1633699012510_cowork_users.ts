import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { CoworkUserRoleEnum } from 'Contracts/enums';

export default class CoworkUsers extends BaseSchema {
  protected tableName = 'cowork_users';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('user_id').unsigned().index();
      table.integer('cowork_account_id').unsigned().index();
      table.string('role').defaultTo(CoworkUserRoleEnum.EMPLOYEE);

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
