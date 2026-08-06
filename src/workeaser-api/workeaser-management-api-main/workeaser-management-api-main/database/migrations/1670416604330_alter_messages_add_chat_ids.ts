import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMessagesAddChatIds extends BaseSchema {
  protected tableName = 'messages';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('chat_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('chat_id');
    });
  }
}
