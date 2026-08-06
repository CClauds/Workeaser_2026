import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddDayPriceRooms extends BaseSchema {
  protected tableName = 'rooms';

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
