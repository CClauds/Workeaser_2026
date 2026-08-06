import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class MeetingDates extends BaseSchema {
  protected tableName = 'meeting_dates';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('meeting_id').unsigned().notNullable().index();
      table.timestamp('date_from', { useTz: true });
      table.timestamp('date_to', { useTz: true });
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
