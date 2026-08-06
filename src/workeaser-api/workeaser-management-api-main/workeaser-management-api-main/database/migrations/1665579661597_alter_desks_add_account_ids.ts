import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDesksAddAccountIds extends BaseSchema {
  protected tableName = 'desks';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('desk_local_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('desk_local_account_id');
    });
  }
}
