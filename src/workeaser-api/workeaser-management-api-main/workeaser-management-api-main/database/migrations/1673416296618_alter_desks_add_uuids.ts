import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDesksAddUuids extends BaseSchema {
  protected tableName = 'desks';

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
