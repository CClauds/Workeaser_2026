import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { MeasurementTypeEnum } from 'Contracts/enums';

export default class Rooms extends BaseSchema {
  protected tableName = 'rooms';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('location_id').unsigned().index();
      table.string('name').notNullable();
      table.text('description').nullable();
      table.string('space_size_unit').defaultTo(MeasurementTypeEnum.METERS);
      table.integer('space_size').notNullable();
      table.integer('room_capacity').notNullable();
      table.boolean('shareable').defaultTo(false);
      table.boolean('searchable').defaultTo(false);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
