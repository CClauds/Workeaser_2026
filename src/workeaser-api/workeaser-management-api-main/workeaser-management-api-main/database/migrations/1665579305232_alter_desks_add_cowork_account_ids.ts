import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDesksAddCoworkAccountIds extends BaseSchema {
  protected tableName = 'desks';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cowork_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cowork_account_id');
    });
  }
}
