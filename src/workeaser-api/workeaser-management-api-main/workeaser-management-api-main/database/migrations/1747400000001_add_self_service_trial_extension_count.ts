/**
 * Sprint H (HF-SPRINT-H-07): rastrear extensões self-service de trial.
 *
 * Limita usuário a estender trial 1x sozinho (max 7 dias).
 * Admin pode estender ilimitadamente (HF-SPRINT-G-05).
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'subscriptions';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('self_service_trial_extensions').unsigned().notNullable().defaultTo(0);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('self_service_trial_extensions');
    });
  }
}
