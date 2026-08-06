import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDayPassAddResidualAmounts extends BaseSchema {
  protected tableName = 'day_passes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('residual_amount');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('residual_amount');
    });
  }
}
