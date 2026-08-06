import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddDayPriceDesks extends BaseSchema {
  protected tableName = 'desks';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('day_price').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('day_price');
    });
  }
}
