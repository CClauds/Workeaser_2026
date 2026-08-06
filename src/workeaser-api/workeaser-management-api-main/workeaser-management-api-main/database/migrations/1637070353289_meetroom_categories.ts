import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class MeetroomCategories extends BaseSchema {
  protected tableName = 'meetroom_categories';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('name');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
