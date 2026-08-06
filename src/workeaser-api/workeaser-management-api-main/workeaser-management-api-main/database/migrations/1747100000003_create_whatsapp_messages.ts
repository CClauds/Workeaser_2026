/**
 * Polish+ (HF-ADVANCE-04): whatsapp_messages
 *
 * Histórico de mensagens WhatsApp transacionais (envio + recebimento via webhook).
 * Compatível com Meta Cloud API, Twilio e Z-API (provider em campo).
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'whatsapp_messages';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary();
      table.string('provider', 30).notNullable().defaultTo('meta_cloud');  // meta_cloud | twilio | zapi
      table.enum('direction', ['outbound', 'inbound']).notNullable();
      table.string('to_phone', 30).notNullable();                            // E.164 (+5511999999999)
      table.string('from_phone', 30).nullable();
      table.string('template_code', 80).nullable();                           // template aprovado pela Meta
      table.json('template_data').nullable();
      table.text('body', 'mediumtext').nullable();
      table.json('media').nullable();                                          // [{type, url, caption}]
      table.enum('status', ['queued', 'sent', 'delivered', 'read', 'failed', 'received']).notNullable().defaultTo('queued');
      table.string('provider_message_id', 191).nullable();
      table.string('error_code', 60).nullable();
      table.string('error_message', 500).nullable();
      table.bigInteger('related_user_id').unsigned().nullable();
      table.string('related_type', 60).nullable();
      table.bigInteger('related_id').unsigned().nullable();
      table.timestamp('sent_at', { useTz: false }).nullable();
      table.timestamp('delivered_at', { useTz: false }).nullable();
      table.timestamp('read_at', { useTz: false }).nullable();
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(this.now());

      table.index(['status'], 'idx_whatsapp_status');
      table.index(['to_phone'], 'idx_whatsapp_to_phone');
      table.index(['related_type', 'related_id'], 'idx_whatsapp_related');
      table.index(['provider_message_id'], 'idx_whatsapp_provider_id');
      table.index(['created_at'], 'idx_whatsapp_created');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
