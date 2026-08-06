import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterAddressZipcodeTypes extends BaseSchema {
  protected tableName = 'addresses'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('zipcode').defaultTo('').alter();
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigInteger('zipcode').defaultTo(null);
    });
  }
}
