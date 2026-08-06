import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterVirtualOfficesSetRenewalTaxDefaults extends BaseSchema {
  protected tableName = 'virtual_offices';

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('renewal_tax').defaultTo(0).alter();
    });
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropNullable('renewal_tax');
    });
  }
}
