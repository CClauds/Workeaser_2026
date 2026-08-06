import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ContractDocuments extends BaseSchema {
  protected tableName = 'contract_documents';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('contract_id').unsigned().index();
      table.integer('document_id').unsigned().index();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
