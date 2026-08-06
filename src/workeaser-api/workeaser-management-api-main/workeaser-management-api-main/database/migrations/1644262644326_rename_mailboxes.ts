import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RenameMailboxes extends BaseSchema {
  protected tableName = 'mailboxs';

  public async up() {
    this.schema.renameTable(this.tableName, 'mailboxes');
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
