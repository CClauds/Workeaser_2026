import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddCostHoursMeetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cost_hours').unsigned();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cost_hours');
    });
  }
}
