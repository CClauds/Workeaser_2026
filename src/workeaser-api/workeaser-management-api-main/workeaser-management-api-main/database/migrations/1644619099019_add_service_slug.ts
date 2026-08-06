import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddServiceSlugs extends BaseSchema {
  protected tableName = 'services';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug').notNullable();
      table.string('abbr').notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug');
      table.dropColumn('abbr');
    });
  }
}
