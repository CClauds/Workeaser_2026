import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterAddressesSetDefaultFulltexts extends BaseSchema {
  protected tableName = 'addresses'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('fulltext').defaultTo('').alter();
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('fulltext');
    });
  }
}
