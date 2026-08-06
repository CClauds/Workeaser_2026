import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddDateStartDateEndContracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.datetime('date_start').nullable();
      table.datetime('date_end').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('date_start');
      table.dropColumn('date_end');
    });
  }
}
