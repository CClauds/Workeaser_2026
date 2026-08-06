import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveWorkingHourMeetrooms extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('working_hour_start');
      table.dropColumn('working_hour_end');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('working_hour_start').notNullable();
      table.string('working_hour_end').notNullable();
    });
  }
}
