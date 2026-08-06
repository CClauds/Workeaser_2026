import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeContractClientAccountToUsers extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('client_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('client_account_id').unsigned().index();
    });
  }
}
