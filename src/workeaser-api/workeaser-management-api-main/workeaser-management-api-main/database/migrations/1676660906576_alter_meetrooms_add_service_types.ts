import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMeetroomsAddServiceTypes extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('service_type').defaultTo('MEETING_ROOM');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('service_type');
    });
  }
}
