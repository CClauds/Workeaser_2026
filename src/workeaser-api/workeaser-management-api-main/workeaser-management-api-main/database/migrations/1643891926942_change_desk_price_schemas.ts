import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeDeskPriceSchemas extends BaseSchema {
  protected tableName = 'desk_prices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('period', 'duration');
      table.renameColumn('price', 'monthly_price');
      table.integer('full_price');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('monthly_price', 'price');
      table.dropColumn('full_price');
    });
  }
}
