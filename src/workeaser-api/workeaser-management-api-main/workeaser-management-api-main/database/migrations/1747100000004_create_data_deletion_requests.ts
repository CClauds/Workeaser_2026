/**
 * Polish+ (HF-ADVANCE-05): data_deletion_requests
 *
 * LGPD/GDPR right-to-be-forgotten. Usuário solicita exclusão; sistema processa em N dias.
 * Anonimiza dados pessoais mantendo integridade referencial.
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'data_deletion_requests';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('user_id').unsigned().notNullable();
      table.string('requester_email_snapshot', 191).notNullable();   // snapshot do email no momento do pedido
      table.enum('status', [
        'requested',              // usuário pediu, aguardando window de retratação (7-15 dias)
        'in_progress',            // sistema processando
        'completed',              // dados anonimizados
        'rejected',               // pedido rejeitado (motivo legal: ordem judicial, etc.)
        'canceled_by_user',       // usuário voltou atrás antes da execução
      ]).notNullable().defaultTo('requested');
      table.text('reason', 'text').nullable();
      table.text('rejection_reason', 'text').nullable();
      table.timestamp('requested_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('scheduled_execution_at', { useTz: false }).nullable();
      table.timestamp('completed_at', { useTz: false }).nullable();
      table.string('processed_by_admin_email', 191).nullable();      // se admin processar
      table.json('redacted_fields_summary').nullable();              // resumo do que foi anonimizado
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(this.now());

      table.index(['user_id'], 'idx_data_deletion_user');
      table.index(['status'], 'idx_data_deletion_status');
      table.index(['scheduled_execution_at'], 'idx_data_deletion_scheduled');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
