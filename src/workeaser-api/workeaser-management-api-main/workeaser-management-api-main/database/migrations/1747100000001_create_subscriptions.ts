/**
 * Polish+ (HF-ADVANCE-02): subscriptions
 *
 * Assinatura ativa de um cliente/cowork em um plano.
 * Espelha o estado do Stripe Subscription localmente (sincronizado por webhook).
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'subscriptions';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('subscription_plan_id').unsigned().notNullable()
        .references('id').inTable('subscription_plans').onDelete('RESTRICT');
      table.bigInteger('cowork_account_id').unsigned().nullable();   // se assinatura é do operador
      table.bigInteger('client_account_id').unsigned().nullable();    // se assinatura é do cliente final
      table.bigInteger('user_id').unsigned().nullable();              // usuário que iniciou

      table.string('stripe_subscription_id', 191).nullable().unique(); // sub_xxx
      table.string('stripe_customer_id', 191).nullable();              // cus_xxx
      table.enum('status', [
        'incomplete',
        'incomplete_expired',
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid',
      ]).notNullable().defaultTo('incomplete');

      table.timestamp('current_period_start', { useTz: false }).nullable();
      table.timestamp('current_period_end', { useTz: false }).nullable();
      table.timestamp('cancel_at', { useTz: false }).nullable();
      table.timestamp('canceled_at', { useTz: false }).nullable();
      table.timestamp('trial_end', { useTz: false }).nullable();
      table.json('metadata').nullable();
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('deleted_at', { useTz: false }).nullable();

      table.index(['cowork_account_id'], 'idx_subscriptions_cowork');
      table.index(['client_account_id'], 'idx_subscriptions_client');
      table.index(['user_id'], 'idx_subscriptions_user');
      table.index(['status'], 'idx_subscriptions_status');
      table.index(['current_period_end'], 'idx_subscriptions_period_end');
      table.index(['deleted_at'], 'idx_subscriptions_deleted_at');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
