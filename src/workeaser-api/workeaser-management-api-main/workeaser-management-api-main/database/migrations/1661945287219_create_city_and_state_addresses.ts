import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CreateCityAndCountryAddresses extends BaseSchema {
  protected tableName = 'addresses';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('city');
      table.string('state');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('city');
      table.dropColumn('state');
    });
  }
}
