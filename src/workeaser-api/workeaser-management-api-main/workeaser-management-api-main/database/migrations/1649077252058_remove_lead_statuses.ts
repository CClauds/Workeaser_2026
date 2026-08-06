import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveLeadStatuses extends BaseSchema {
  protected tableName = 'leads';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status');
    });
  }
}
