import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddRecurringTypeTaxes extends BaseSchema {
  protected tableName = 'taxes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('recurring_type');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('recurring_type');
    });
  }
}
