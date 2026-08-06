import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ContractRenewals extends BaseSchema {
  protected tableName = 'contract_renewals';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('contract_id').unsigned().notNullable().index();
      table.date('date_start').notNullable();
      table.date('date_end').notNullable();
      table.string('term_size').notNullable();
      table.integer('amount').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
