import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { ToursStatusEnum } from 'Contracts/enums';

export default class Tours extends BaseSchema {
  protected tableName = 'tours';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('lead_id').unsigned().index();
      table.timestamp('date_start', { useTz: true }).nullable();
      table.timestamp('date_end', { useTz: true }).nullable();
      table.string('status').defaultTo(ToursStatusEnum.SOLICITED);
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
