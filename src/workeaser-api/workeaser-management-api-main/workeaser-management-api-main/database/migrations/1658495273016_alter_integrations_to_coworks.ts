import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterIntegrationsToCoworks extends BaseSchema {
  protected tableName = 'integrations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('client_account_id', 'cowork_account_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('cowork_account_id', 'client_account_id');
    });
  }
}
