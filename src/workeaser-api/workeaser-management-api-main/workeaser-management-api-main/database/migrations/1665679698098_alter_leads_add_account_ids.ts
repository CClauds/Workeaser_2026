import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterLeadsAddAccountIds extends BaseSchema {
  protected tableName = 'leads';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('lead_local_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('lead_local_account_id');
    });
  }
}
