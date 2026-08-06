import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { SpaceReserveInquireTypesEnum } from 'Contracts/enums';

export default class SpaceReserveRequests extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('client_account_id').unsigned().index().notNullable();
      table.integer('location_id').unsigned().index().notNullable();
      table.string('service_type').notNullable().index();
      table.integer('resource_id').unsigned().notNullable().index();
      table.string('inquire_type').defaultTo(SpaceReserveInquireTypesEnum.NEW_OPPORTUNITY);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
