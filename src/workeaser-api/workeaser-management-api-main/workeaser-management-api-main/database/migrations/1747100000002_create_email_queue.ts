/**
 * Polish+ (HF-ADVANCE-03): email_queue
 *
 * Fila durável para emails transacionais. Desacopla request → SES.
 * Worker (cron ou serviço dedicado) consome rows com status='pending'.
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'email_queue';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary();
      table.string('to_email', 191).notNullable();
      table.string('to_name', 191).nullable();
      table.string('from_email', 191).notNullable();
      table.string('subject', 500).notNullable();
      table.text('body_html', 'mediumtext').nullable();
      table.text('body_text', 'mediumtext').nullable();
      table.string('template_code', 80).nullable();           // referência ao template
      table.json('template_data').nullable();                  // dados para interpolar
      table.json('attachments').nullable();                    // [{name, contentBase64, contentType}]
      table.enum('status', ['pending', 'sending', 'sent', 'failed', 'bounced']).notNullable().defaultTo('pending');
      table.integer('attempts').unsigned().notNullable().defaultTo(0);
      table.integer('max_attempts').unsigned().notNullable().defaultTo(5);
      table.timestamp('next_attempt_at', { useTz: false }).nullable();
      table.timestamp('sent_at', { useTz: false }).nullable();
      table.string('provider_message_id', 191).nullable();    // ID do SES após envio
      table.string('last_error', 500).nullable();
      table.bigInteger('related_user_id').unsigned().nullable();
      table.string('related_type', 60).nullable();             // 'invoice', 'contract', 'user', etc.
      table.bigInteger('related_id').unsigned().nullable();
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(this.now());

      table.index(['status', 'next_attempt_at'], 'idx_email_queue_picking');
      table.index(['related_type', 'related_id'], 'idx_email_queue_related');
      table.index(['to_email'], 'idx_email_queue_to');
      table.index(['created_at'], 'idx_email_queue_created');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
