import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterVirtualOfficesAddAccountIds extends BaseSchema {
  protected tableName = 'virtual_offices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('virt_office_local_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('virt_office_local_account_id');
    });
  }
}
