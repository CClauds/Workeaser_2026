import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ContractTaxes extends BaseSchema {
  protected tableName = 'contract_taxes';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('photo_id').unsigned().index().nullable();
      table.string('name').notNullable();
      table.integer('amount').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
