import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddContractDocument extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('contract_document_id').unsigned().index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('contract_document_id');
    });
  }
}
