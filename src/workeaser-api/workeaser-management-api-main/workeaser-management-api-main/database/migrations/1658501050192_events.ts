import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Events extends BaseSchema {
  protected tableName = 'events';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('calendar_integration_id').index().notNullable();
      table.string('event_id').index().notNullable();
      table.string('booking_type');
      table.integer('resource_id');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });

      table.index(['booking_type', 'resource_id']);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
