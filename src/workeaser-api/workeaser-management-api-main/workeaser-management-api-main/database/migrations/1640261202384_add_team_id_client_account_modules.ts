import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddTeamIdClientAccountModules extends BaseSchema {
  protected tableName = 'client_account_modules';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('team_id').unsigned().index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('team_id');
    });
  }
}
