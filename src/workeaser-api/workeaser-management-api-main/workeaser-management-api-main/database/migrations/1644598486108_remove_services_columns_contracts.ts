import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveServicesColumnsContracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('virtual_office_price_id');
      table.dropColumn('meeting_room_id');
      table.dropColumn('shared_desk_price_id');
      table.dropColumn('exclusive_desk_price_id');
      table.dropColumn('private_room_price_id');

      table.integer('resource_id').unsigned().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('virtual_office_price_id').unsigned().notNullable();
      table.integer('meeting_room_id').unsigned().notNullable();
      table.integer('shared_desk_price_id').unsigned().notNullable();
      table.integer('exclusive_desk_price_id').unsigned().notNullable();
      table.integer('private_room_price_id').unsigned().notNullable();

      table.dropColumn('resource_id');
    });
  }
}
