import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ContractUsages extends BaseSchema {
  protected tableName = 'contract_usages';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('contract_id').unsigned().nullable().index();
      table.integer('user_id').unsigned().nullable().index();
      table.string('service_type').notNullable().index();
      table.integer('quantity_minutes').unsigned().notNullable();
      table.timestamp('booking_date', { useTz: true });
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
