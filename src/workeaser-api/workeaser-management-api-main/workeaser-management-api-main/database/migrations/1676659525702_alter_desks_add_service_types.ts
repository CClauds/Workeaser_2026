import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDesksAddServiceTypes extends BaseSchema {
  protected tableName = 'desks';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('service_type').defaultTo('OPEN_DESK');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('service_type');
    });
  }
}
