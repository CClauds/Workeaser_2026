import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class MessageAttachments extends BaseSchema {
  protected tableName = 'message_attachments';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('message_id').unsigned().index();
      table.integer('document_id').unsigned().index();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
