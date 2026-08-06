import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterAddressesAddFulltext2s extends BaseSchema {
  protected tableName = 'addresses'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('fulltext2').defaultTo('');
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('fulltext2');
    });
  }
}
