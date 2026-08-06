/**
 * Polish+ (HF-ADVANCE-01): subscription_plans
 *
 * Base para cobrança recorrente Stripe Subscriptions.
 * Cada plano tem 1 stripe_price_id (referência à API Stripe).
 * Reversível.
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'subscription_plans';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary();
      table.string('code', 60).notNullable().unique();        // 'solo', 'growth', 'network'
      table.string('name', 120).notNullable();
      table.string('description', 500).nullable();
      table.string('currency', 3).notNullable().defaultTo('USD');
      table.integer('amount_cents').unsigned().notNullable(); // 4900 = USD 49.00
      table.enum('interval', ['monthly', 'yearly']).notNullable().defaultTo('monthly');
      table.string('stripe_price_id', 191).nullable();        // price_xxx do Stripe
      table.json('features').nullable();                       // limites do plano em JSON
      table.boolean('active').notNullable().defaultTo(true);
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('deleted_at', { useTz: false }).nullable();

      table.index(['code'], 'idx_subscription_plans_code');
      table.index(['active'], 'idx_subscription_plans_active');
      table.index(['deleted_at'], 'idx_subscription_plans_deleted_at');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
