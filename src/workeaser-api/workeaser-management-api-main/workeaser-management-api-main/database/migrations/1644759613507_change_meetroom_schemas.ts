import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeMeetroomSchemas extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('type').notNullable();
      table.string('working_hour_start').notNullable();
      table.string('working_hour_end').notNullable();
      table.string('rental_timeframe').notNullable();
      table.string('minimum_rental').notNullable();
      table.integer('cancelation_full').notNullable();
      table.integer('cancelation_half').notNullable();
      table.integer('cancelation_no').notNullable();

      table.dropColumn('category_id');
      table.dropColumn('min_rental_time');
      table.dropColumn('booking_interval');
      table.dropColumn('booking_timeframe');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type');
      table.dropColumn('working_hour_start');
      table.dropColumn('working_hour_end');
      table.dropColumn('rental_timeframe');
      table.dropColumn('minimum_rental');
      table.dropColumn('cancelation_full');
      table.dropColumn('cancelation_half');
      table.dropColumn('cancelation_no');

      table.integer('category_id').index().unsigned();
      table.string('min_rental_time');
      table.string('booking_interval');
      table.string('booking_timeframe');
    });
  }
}
