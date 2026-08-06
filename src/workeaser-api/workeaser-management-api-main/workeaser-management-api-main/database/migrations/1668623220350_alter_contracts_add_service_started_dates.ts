import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterContractsAddServiceStartedDates extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dateTime('service_started_date');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('service_started_date');
    });
  }
}
