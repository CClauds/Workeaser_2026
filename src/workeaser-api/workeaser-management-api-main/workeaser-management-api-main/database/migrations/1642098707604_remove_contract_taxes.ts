import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveContractTaxes extends BaseSchema {
  protected tableName = 'contract_taxes';

  public async up() {
    this.schema.dropTableIfExists(this.tableName);
  }

  public async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('contract_id').unsigned().index().nullable();
      table.string('name').notNullable();
      table.integer('amount').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }
}
