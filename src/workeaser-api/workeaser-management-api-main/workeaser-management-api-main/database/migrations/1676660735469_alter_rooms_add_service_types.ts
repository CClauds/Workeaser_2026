import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterRoomsAddServiceTypes extends BaseSchema {
  protected tableName = 'rooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('service_type').defaultTo('PRIVATE_ROOM');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('service_type');
    });
  }
}
