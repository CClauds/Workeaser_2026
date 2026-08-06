import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterAddressesAddZipcodes extends BaseSchema {
  protected tableName = 'addresses'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigInteger('zipcode').defaultTo(null);
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('zipcode');
    });
  }
}
