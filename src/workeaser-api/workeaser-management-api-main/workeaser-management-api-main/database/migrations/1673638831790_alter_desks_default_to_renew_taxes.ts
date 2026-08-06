import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDesksDefaultToRenewTaxes extends BaseSchema {
  protected tableName = 'desks';

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
