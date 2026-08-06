import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterContractsAddRequestSigns extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('request_sign').defaultTo(true);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('request_sign');
    });
  }
}
