import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMessagesAddSentBies extends BaseSchema {
  protected tableName = 'messages';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('sent_by');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sent_by');
    });
  }
}
