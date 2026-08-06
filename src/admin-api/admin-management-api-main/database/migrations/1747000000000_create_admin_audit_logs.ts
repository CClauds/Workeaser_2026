/**
 * Polish Lote (HF-POLISH-03): tabela admin_audit_logs.
 *
 * Cobre eventos do Admin API: login, criação/edição de partner, suspensão/reativação
 * de usuário, alterações em clients/coworkings. Migration reversível (up/down).
 *
 * Não armazena senha nem token. `metadata` é JSON com chaves não-sensíveis.
 */
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'admin_audit_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.string('event', 80).notNullable()
      table.bigInteger('actor_partner_id').unsigned().nullable()
      table.string('actor_email', 191).nullable()
      table.string('target_type', 60).nullable()
      table.bigInteger('target_id').unsigned().nullable()
      table.string('ip', 64).nullable()
      table.string('user_agent', 255).nullable()
      table.string('outcome', 20).notNullable().defaultTo('success')  // success | failure
      table.json('metadata').nullable()
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now())

      table.index(['event'], 'idx_admin_audit_event')
      table.index(['actor_partner_id'], 'idx_admin_audit_actor')
      table.index(['target_type', 'target_id'], 'idx_admin_audit_target')
      table.index(['created_at'], 'idx_admin_audit_created_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
