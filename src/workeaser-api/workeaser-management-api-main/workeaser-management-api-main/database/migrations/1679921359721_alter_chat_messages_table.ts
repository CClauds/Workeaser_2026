import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CreateNewMessageTables extends BaseSchema {
  protected tableName = 'chat_messages';

  public async up() {
    const [isSentBy, isToUserId] = await Promise.all([
      this.schema.hasColumn(this.tableName, 'sent_by'),
      this.schema.hasColumn(this.tableName, 'to_user_id')
    ]);

    if (isSentBy) {
      this.schema.alterTable(this.tableName, (t) => t.dropColumn('sent_by'));
    }
    if (isToUserId) {
      this.schema.alterTable(this.tableName, (t) => t.dropColumn('to_user_id'));
    }

    this.schema.alterTable(this.tableName, (table) => {
      table.index('chat_id');
      table.integer('from_user_id').unsigned().alter();
      table.foreign('from_user_id').references('users.id');
      table.integer('chat_id').notNullable().unsigned().alter();
      table.foreign('chat_id').references('chats.id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('chat_id');
      table.string('sent_by', 255);
      table.integer('to_user_id');
      table.dropForeign('from_user_id');
      table.integer('chat_id').nullable().alter();
      table.dropForeign('chat_id');
    });
  }
}
