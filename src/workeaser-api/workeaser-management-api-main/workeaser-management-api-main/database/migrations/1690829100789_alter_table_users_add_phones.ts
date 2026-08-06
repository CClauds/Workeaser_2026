import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterTableUsersAddPhones extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('phone').defaultTo(''); 
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('phone');
    })
  }
}
