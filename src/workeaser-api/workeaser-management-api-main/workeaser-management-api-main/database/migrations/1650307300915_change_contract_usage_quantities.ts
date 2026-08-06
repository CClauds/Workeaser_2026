import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeContractUsageQuantities extends BaseSchema {
  protected tableName = 'contract_usages';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('quantity_minutes', 'quantity_credits');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('quantity_credits', 'quantity_minutes');
    });
  }
}
