import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMeetroomsAddUuids extends BaseSchema {
  protected tableName = 'meetrooms';

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
