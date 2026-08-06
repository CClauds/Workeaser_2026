import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterRoomsDefaultToRenewTaxes extends BaseSchema {
  protected tableName = 'rooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('renewal_tax').defaultTo(0).alter();
    });
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropNullable('renewal_tax');
    });
  }
}
