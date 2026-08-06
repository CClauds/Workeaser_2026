import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDesksAddSlugs extends BaseSchema {
  protected tableName = 'desks';

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
