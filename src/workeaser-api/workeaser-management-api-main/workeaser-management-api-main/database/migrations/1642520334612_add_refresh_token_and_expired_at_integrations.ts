import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddRefreshTokenAndExpiresAtIntegrations extends BaseSchema {
  protected tableName = 'integrations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('refresh_token').after('token');
      table.timestamp('expired_at', { useTz: true }).after('refresh_token');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('refresh_token');
      table.dropColumn('expired_at');
    });
  }
}
