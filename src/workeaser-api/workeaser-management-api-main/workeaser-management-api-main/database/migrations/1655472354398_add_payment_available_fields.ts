import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPaymentAvailableFields extends BaseSchema {
  protected tableName = 'payments';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('available').notNullable().defaultTo(0);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('available');
    });
  }
}
