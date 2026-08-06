import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class MeetroomPhotos extends BaseSchema {
  protected tableName = 'meetroom_photos';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('meetroom_id').unsigned().index();
      table.integer('photo_id').unsigned().index();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
