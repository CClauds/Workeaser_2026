import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterSpaceReserveRequetAddTermSizes extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('term_size');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('term_size');
    });
  }
}
