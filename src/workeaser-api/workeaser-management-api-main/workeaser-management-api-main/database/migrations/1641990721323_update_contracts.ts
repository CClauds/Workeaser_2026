import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UpdateContracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('virtual_office_id', 'virtual_office_price_id');
      table.renameColumn('shared_desk_id', 'shared_desk_price_id');
      table.renameColumn('exclusive_desk_id', 'exclusive_desk_price_id');
      table.renameColumn('private_room_id', 'private_room_price_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('virtual_office_price_id', 'virtual_office_id');
      table.renameColumn('shared_desk_price_id', 'shared_desk_id');
      table.renameColumn('exclusive_desk_price_id', 'exclusive_desk_id');
      table.renameColumn('private_room_price_id', 'private_room_id');
    });
  }
}
