import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddCountryAddresses extends BaseSchema {
  protected tableName = 'addresses';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('country').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('country');
    });
  }
}
