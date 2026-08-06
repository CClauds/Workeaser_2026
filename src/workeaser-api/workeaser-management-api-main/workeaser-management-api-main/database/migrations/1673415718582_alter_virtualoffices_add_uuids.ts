import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterVirtualofficesAddUuids extends BaseSchema {
  protected tableName = 'virtual_offices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('uuid').notNullable().unique();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('uuid').notNullable().unique();
    });
  }
}
