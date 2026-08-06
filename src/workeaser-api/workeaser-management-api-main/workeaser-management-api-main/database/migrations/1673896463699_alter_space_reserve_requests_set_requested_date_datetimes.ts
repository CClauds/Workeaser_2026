import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterSpaceReserveRequestsSetRequestedDateDatetimes extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dateTime('requested_date').alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dateTime('requested_date').alter();
    });
  }
}
