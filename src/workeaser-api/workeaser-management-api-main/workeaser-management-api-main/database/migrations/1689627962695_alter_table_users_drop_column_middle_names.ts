import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterTableUsersDropColumnMiddleNames extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {     
      table.dropColumn('middle_name');
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('middle_name').notNullable();
    });
  }
}
