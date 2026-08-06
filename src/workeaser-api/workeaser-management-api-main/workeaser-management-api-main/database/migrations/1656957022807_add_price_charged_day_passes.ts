import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPriceChargedDayPasses extends BaseSchema {
  protected tableName = 'day_passes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('price_charged').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('price_charged');
    });
  }
}
