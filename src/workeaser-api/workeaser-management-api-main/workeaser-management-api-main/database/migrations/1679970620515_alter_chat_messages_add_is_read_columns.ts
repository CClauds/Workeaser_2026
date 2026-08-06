import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterChatMessagesAddIsReadColumns extends BaseSchema {
  protected tableName = 'chat_messages';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_read').defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (t) => {
      t.dropColumn('is_read');
    });
  }
}
