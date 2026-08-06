import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CreateNewMessageTables extends BaseSchema {
  protected newTableName = 'chat_messages';
  protected tableName = 'messages';

  public async up() {
    this.schema.renameTable(this.tableName, this.newTableName);
  }

  public async down() {
    this.schema.renameTable(this.newTableName, this.tableName);
  }
}
