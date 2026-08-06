import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterSpaceReserveRequetAddLocationNames extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('location_name');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('location_name');
    });
  }
}
