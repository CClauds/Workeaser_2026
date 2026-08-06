import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CoworkStripeAccounts extends BaseSchema {
  protected tableName = 'cowork_stripe_accounts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').index().notNullable();
      table.string('account_id').index();
      table.boolean('in_review').defaultTo(false);
      table.boolean('need_update').defaultTo(false);
      table.boolean('need_external_account').defaultTo(false);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
