import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class MailboxHistories extends BaseSchema {
  protected tableName = 'mailbox_histories';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('mailbox_id').index().notNullable();
      table.string('status');
      table.text('message').nullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
