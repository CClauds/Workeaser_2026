import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterCoworkStripeAccountsAddStatuses extends BaseSchema {
  protected tableName = 'cowork_stripe_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status');
    });
  }
}
