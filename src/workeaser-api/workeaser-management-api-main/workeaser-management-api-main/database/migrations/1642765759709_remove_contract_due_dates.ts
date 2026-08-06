import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveContractDueDates extends BaseSchema {
  protected tableName = 'cowork_settings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('contract_due_date');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('contract_due_date');
    });
  }
}
