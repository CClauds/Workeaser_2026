import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterCoworkUsersAddUuids extends BaseSchema {
  protected tableName = 'cowork_users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('uuid').index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uuid');
    });
  }
}
