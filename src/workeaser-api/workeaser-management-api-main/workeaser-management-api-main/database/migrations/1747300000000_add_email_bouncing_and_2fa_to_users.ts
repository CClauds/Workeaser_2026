/**
 * Sprint D (HF-SPRINT-D-01): adicionar flags de deliverability + 2FA TOTP em users.
 *
 * - email_bouncing: true = SES hard bounce, parar envios pra esse user
 * - email_complaint: true = user marcou como spam, NUNCA mais enviar
 * - email_bouncing_at: timestamp do evento
 * - email_bouncing_reason: motivo (Permanent | Transient | Complaint)
 * - 2fa_enabled: usuário ativou 2FA
 * - 2fa_secret_cipher: TOTP secret cifrado via SecretCipher
 * - 2fa_backup_codes_cipher: backup codes cifrados (JSON array)
 *
 * Reversível.
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('email_bouncing').notNullable().defaultTo(false);
      table.boolean('email_complaint').notNullable().defaultTo(false);
      table.timestamp('email_bouncing_at', { useTz: false }).nullable();
      table.string('email_bouncing_reason', 120).nullable();

      table.boolean('two_factor_enabled').notNullable().defaultTo(false);
      table.string('two_factor_secret_cipher', 500).nullable();
      table.text('two_factor_backup_codes_cipher').nullable();
      table.timestamp('two_factor_enabled_at', { useTz: false }).nullable();

      table.index(['email_bouncing'], 'idx_users_email_bouncing');
      table.index(['email_complaint'], 'idx_users_email_complaint');
      table.index(['two_factor_enabled'], 'idx_users_2fa_enabled');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['email_bouncing'], 'idx_users_email_bouncing');
      table.dropIndex(['email_complaint'], 'idx_users_email_complaint');
      table.dropIndex(['two_factor_enabled'], 'idx_users_2fa_enabled');
      table.dropColumn('email_bouncing');
      table.dropColumn('email_complaint');
      table.dropColumn('email_bouncing_at');
      table.dropColumn('email_bouncing_reason');
      table.dropColumn('two_factor_enabled');
      table.dropColumn('two_factor_secret_cipher');
      table.dropColumn('two_factor_backup_codes_cipher');
      table.dropColumn('two_factor_enabled_at');
    });
  }
}
