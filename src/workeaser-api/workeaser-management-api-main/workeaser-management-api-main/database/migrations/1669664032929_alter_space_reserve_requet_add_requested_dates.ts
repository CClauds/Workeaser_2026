import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterSpaceReserveRequetAddRequestedDates extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('requested_date');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('requested_date');
    });
  }
}
