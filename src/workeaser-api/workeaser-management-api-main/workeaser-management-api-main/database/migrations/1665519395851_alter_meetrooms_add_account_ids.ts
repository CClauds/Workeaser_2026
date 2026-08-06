import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMeetroomsAddAccountIds extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('meetroom_local_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('meetroom_local_account_id');
    });
  }
}
