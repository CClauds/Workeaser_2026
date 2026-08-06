import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Meetrooms extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('category_id').unsigned().index();
      table.integer('location_id').unsigned().index();
      table.string('name');
      table.text('description');
      table.string('measure_unit');
      table.integer('measure_size');
      table.string('measure_occupancy');
      table.string('min_rental_time');
      table.string('booking_interval');
      table.string('booking_timeframe');
      table.string('price');
      table.boolean('need_confirmation');

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
