import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddSearchableVirtualOffices extends BaseSchema {
  protected tableName = 'virtual_offices';

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
