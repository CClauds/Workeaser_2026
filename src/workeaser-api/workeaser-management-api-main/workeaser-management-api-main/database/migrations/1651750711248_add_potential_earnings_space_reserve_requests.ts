import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPotentialEarningsSpaceReserveRequests extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('potential_earnings').defaultTo(0).notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('potential_earnings');
    });
  }
}
