import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterSpaceReserveRequetAddRequestedServices extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('requested_service');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('requested_service');
    });
  }
}
