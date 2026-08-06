import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterVirtualOfficesAddServiceTypes extends BaseSchema {
  protected tableName = 'virtual_offices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('service_type').defaultTo('VIRTUAL_OFFICE');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('service_type');
    });
  }
}
