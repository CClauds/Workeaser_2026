import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddForcePasswordChangeToUsers extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('must_change_password').defaultTo(false).after('email_confirmed');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('must_change_password');
    });
  }
}
