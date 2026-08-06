import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddSearchableDesks extends BaseSchema {
  protected tableName = 'desks';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('searchable').defaultTo(true);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('searchable');
    });
  }
}
