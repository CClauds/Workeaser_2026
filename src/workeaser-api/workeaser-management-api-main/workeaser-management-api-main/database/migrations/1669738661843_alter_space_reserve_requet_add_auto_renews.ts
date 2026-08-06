import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterSpaceReserveRequetAddAutoRenews extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('auto_renew');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('auto_renew');
    });
  }
}
