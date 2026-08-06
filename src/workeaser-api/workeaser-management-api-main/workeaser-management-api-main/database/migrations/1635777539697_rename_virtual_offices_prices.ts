import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RenameVirtualOfficesPrices extends BaseSchema {
  protected tableName = 'virtual_offices_prices';

  public async up() {
    this.schema.renameTable(this.tableName, 'virtual_office_prices');
  }

  public async down() {
    this.schema.renameTable('virtual_office_prices', this.tableName);
  }
}
