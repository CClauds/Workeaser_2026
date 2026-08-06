import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class DayPassTaxes extends BaseSchema {
  protected tableName = 'day_pass_taxes';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('day_pass_id').unsigned().notNullable().index();
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.integer('value').notNullable();
      table.string('method').notNullable();
      table.string('recurring_type').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
