import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddRenewalTaxVirtualOffices extends BaseSchema {
  protected tableName = 'virtual_offices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('renewal_tax').unsigned().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('renewal_tax');
    });
  }
}
