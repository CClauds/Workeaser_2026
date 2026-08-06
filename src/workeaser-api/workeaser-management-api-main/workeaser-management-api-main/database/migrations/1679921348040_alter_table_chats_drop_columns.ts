import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CreateNewChatTables extends BaseSchema {
  protected tableName = 'chats';

  public async up() {
    const [isUUID, isClientUserId, isCoworkUserId] = await Promise.all([
      this.schema.hasColumn(this.tableName, 'uuid'),
      this.schema.hasColumn(this.tableName, 'client_user_id'),
      this.schema.hasColumn(this.tableName, 'cowork_user_id')
    ]);
    if (!isUUID) {
      await this.schema.alterTable(this.tableName, (t) => t.string('uuid').unique().index());
    }
    if (isClientUserId) {
      await this.schema.alterTable(this.tableName, (t) => t.dropColumn('client_user_id'));
    }
    if (isCoworkUserId) {
      await this.schema.alterTable(this.tableName, (t) => t.dropColumn('cowork_user_id'));
    }
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uuid');
      table.integer('client_user_id');
      table.integer('cowork_account_id');
    });
  }
}
