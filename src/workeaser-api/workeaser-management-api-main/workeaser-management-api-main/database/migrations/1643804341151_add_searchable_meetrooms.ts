import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddSearchableMeetrooms extends BaseSchema {
  protected tableName = 'meetrooms';

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
