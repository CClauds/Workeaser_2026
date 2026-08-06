/**
 * Sprint H (HF-SPRINT-H-01): discount_codes + discount_redemptions.
 *
 * - discount_codes: cupons criados pelo admin (BLACKFRIDAY30, ABRIL10, etc.)
 * - discount_redemptions: rastreia uso (qual cliente usou qual cupom em qual subscription)
 *
 * Mapeamento Stripe: armazena `stripe_coupon_id` opcional — admin pode criar cupom
 * no painel Stripe e linkar aqui, ou criar localmente sem Stripe (aplicação manual).
 *
 * Validações no service: max_redemptions global, max_per_user, valid_until.
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  public async up() {
    // Tabela 1: cupons
    this.schema.createTable('discount_codes', (table) => {
      table.bigIncrements('id').primary();
      table.string('code', 60).notNullable().unique();
      table.string('description', 255).nullable();
      table.enum('discount_type', ['percent', 'fixed']).notNullable();
      table.integer('discount_value').unsigned().notNullable(); // percent (1-100) ou fixed (cents)
      table.string('currency', 3).nullable(); // só pra fixed
      table.string('stripe_coupon_id', 191).nullable(); // se existir no Stripe
      table.integer('max_redemptions').unsigned().nullable(); // null = ilimitado
      table.integer('max_per_user').unsigned().notNullable().defaultTo(1);
      table.integer('current_redemptions').unsigned().notNullable().defaultTo(0);
      table.boolean('active').notNullable().defaultTo(true);
      // Restrição a planos específicos (CSV de plan_ids) — null = todos
      table.string('restricted_to_plan_ids', 255).nullable();
      table.timestamp('valid_from', { useTz: false }).nullable();
      table.timestamp('valid_until', { useTz: false }).nullable();
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('deleted_at', { useTz: false }).nullable();

      table.index(['code'], 'idx_discount_codes_code');
      table.index(['active'], 'idx_discount_codes_active');
      table.index(['valid_until'], 'idx_discount_codes_valid_until');
    });

    // Tabela 2: redemptions
    this.schema.createTable('discount_redemptions', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('discount_code_id').unsigned().notNullable()
        .references('id').inTable('discount_codes').onDelete('RESTRICT');
      table.bigInteger('user_id').unsigned().notNullable();
      table.bigInteger('subscription_id').unsigned().nullable();
      table.string('currency', 3).notNullable();
      table.integer('amount_off_cents').unsigned().notNullable(); // valor descontado nesse uso
      table.timestamp('redeemed_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());

      table.index(['discount_code_id'], 'idx_discount_redemptions_code');
      table.index(['user_id'], 'idx_discount_redemptions_user');
      table.index(['subscription_id'], 'idx_discount_redemptions_subscription');
    });
  }

  public async down() {
    this.schema.dropTable('discount_redemptions');
    this.schema.dropTable('discount_codes');
  }
}
