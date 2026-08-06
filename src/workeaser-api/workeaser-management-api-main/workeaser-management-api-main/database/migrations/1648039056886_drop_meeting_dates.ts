import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class DropMeetingDates extends BaseSchema {
  protected tableName = 'meeting_dates';

  public async up() {
    this.schema.dropTable(this.tableName);
  }

  public async down() {
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
}
