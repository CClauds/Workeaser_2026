import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UpdateClientAccountIdAndTokenIntegrations extends BaseSchema {
  protected tableName = 'integrations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('client_account_id').notNullable().alter();
      table.text('token').notNullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('token').notNullable().alter();
      table.integer('client_account_id').nullable().alter();
    });
  }
}
