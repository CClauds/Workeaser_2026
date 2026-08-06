import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { DayPassStatusEnum, ServicesEnum } from 'Contracts/enums';

export default class DayPasses extends BaseSchema {
  protected tableName = 'day_passes';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('lead_id').unsigned().index();
      table.date('date').nullable();
      table.string('status').defaultTo(DayPassStatusEnum.SOLICITED);
      table.string('space').defaultTo(ServicesEnum.OPEN_DESK).notNullable();
      table.integer('location_id').unsigned().index().nullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
