import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterRoomsAddSlugs extends BaseSchema {
  protected tableName = 'rooms';

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
