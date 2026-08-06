import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddCoworkAccountIdSpaceReserveRequests extends BaseSchema {
  protected tableName = 'space_reserve_requests';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cowork_account_id').unsigned().index().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cowork_account_id');
    });
  }
}
