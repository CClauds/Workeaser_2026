import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMessagesAddColumnsSentBies extends BaseSchema {
  protected tableName = 'chat_messages';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('sent_by', ['CLIENT', 'COWORK']).notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sent_by');
    });
  }
}
