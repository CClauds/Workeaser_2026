/**
 * Sprint A (HF-SPRINT-A-01): adicionar stripe_customer_id ao users.
 *
 * Permite que 1 user tenha 1 Stripe Customer reutilizável entre múltiplas
 * subscriptions e payment methods. Reversível.
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('stripe_customer_id', 191).nullable().after('email');
      table.index(['stripe_customer_id'], 'idx_users_stripe_customer_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['stripe_customer_id'], 'idx_users_stripe_customer_id');
      table.dropColumn('stripe_customer_id');
    });
  }
}
