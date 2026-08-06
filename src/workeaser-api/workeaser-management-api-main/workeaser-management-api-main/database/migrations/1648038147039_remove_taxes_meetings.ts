import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveTaxesMeetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('amount_taxes');
      table.dropColumn('amount_taxes_overdue');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('amount_taxes');
      table.integer('amount_taxes_overdue');
    });
  }
}
