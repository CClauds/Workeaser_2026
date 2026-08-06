/**
 * Sprint H (HF-SPRINT-H-08): webhook_dead_letter_queue.
 *
 * Quando um handler de webhook falha (DB down, integração externa caiu, bug),
 * NÃO podemos só logar e ignorar — o evento se perdeu. Stripe re-envia algumas
 * vezes mas tem limite. Solução: gravar evento em fila persistente, worker
 * tenta reprocessar com backoff exponencial.
 *
 * Fluxo:
 *   Webhook recebe payload → handler processa
 *     → sucesso: registerNonce + 200 OK (sem entry na DLQ)
 *     → falha: cria entry na DLQ com payload completo → 200 OK (Stripe não re-tenta)
 *   Cron `ProcessWebhookRetryQueue` (5min) → busca status='pending' com next_attempt_at <= NOW
 *     → tenta reprocessar invocando o mesmo handler
 *     → sucesso: status='resolved', resolved_at=NOW
 *     → falha: incrementa attempts, status='failed' se >= max, senão 'pending' + backoff
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'webhook_dead_letter_queue';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary();
      table.string('provider', 30).notNullable(); // stripe | whatsapp | ses | docusign | boldsign
      table.string('event_type', 120).notNullable(); // ex: 'invoice.paid', 'Bounce', etc.
      table.string('event_id', 191).nullable(); // ID original do provider (idempotência)
      table.text('payload', 'mediumtext').notNullable(); // JSON raw
      table.enum('status', ['pending', 'processing', 'resolved', 'failed']).notNullable().defaultTo('pending');
      table.integer('attempts').unsigned().notNullable().defaultTo(0);
      table.integer('max_attempts').unsigned().notNullable().defaultTo(10);
      table.timestamp('next_attempt_at', { useTz: false }).nullable();
      table.timestamp('resolved_at', { useTz: false }).nullable();
      table.text('last_error', 'text').nullable();
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(this.now());

      table.index(['status', 'next_attempt_at'], 'idx_wdlq_picking');
      table.index(['provider', 'event_id'], 'idx_wdlq_event');
      table.index(['created_at'], 'idx_wdlq_created');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
