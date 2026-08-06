import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddDateStartDateEndMeetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('date_start', { useTz: true });
      table.timestamp('date_end', { useTz: true });
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('date_start');
      table.dropColumn('date_end');
    });
  }
}
