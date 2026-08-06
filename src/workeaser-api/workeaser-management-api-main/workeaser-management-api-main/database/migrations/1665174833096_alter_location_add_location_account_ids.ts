import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterLocationAddLocationAccountIds extends BaseSchema {
  protected tableName = 'locations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('location_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('location_account_id');
    });
  }
}
