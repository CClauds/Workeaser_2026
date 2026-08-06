import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class CoworkExternalAccounts extends BaseSchema {
  protected tableName = 'cowork_external_accounts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_stripe_account_id').index().notNullable();
      table.string('stripe_id').notNullable().index();
      table.string('type').notNullable().index();

      table.string('holder_name').nullable();
      table.string('holder_type').nullable();
      table.string('bank_name').nullable();
      table.string('country').nullable();
      table.string('last_digits').nullable();
      table.string('routing_number').nullable();
      table.string('brand').nullable();
      table.integer('exp_month').nullable();
      table.integer('exp_year').nullable();
      table.boolean('default_for_currency').defaultTo(false);

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
