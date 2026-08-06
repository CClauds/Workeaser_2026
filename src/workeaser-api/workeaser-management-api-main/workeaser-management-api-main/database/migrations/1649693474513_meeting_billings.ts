import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class MeetingBillings extends BaseSchema {
  protected tableName = 'meeting_billings';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('meeting_id').unsigned().notNullable().index();
      table.integer('quantity_minutes').unsigned().notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
