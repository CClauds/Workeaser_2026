import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterRoomsAddAccountIds extends BaseSchema {
  protected tableName = 'rooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('room_local_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('room_local_account_id');
    });
  }
}
