import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddResourceIdContractUsages extends BaseSchema {
  protected tableName = 'contract_usages';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('resource_id').unsigned().index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('resource_id');
    });
  }
}
