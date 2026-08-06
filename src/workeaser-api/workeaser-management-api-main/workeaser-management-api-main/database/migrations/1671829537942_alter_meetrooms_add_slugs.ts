import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMeetroomsAddSlugs extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug');
    });
  }
}
