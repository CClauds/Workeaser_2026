import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B2: Contrato-servicio (service contract).
 * Un cliente puede tener N contratos-servicio simultáneos.
 * CADA contrato-servicio tiene SU PROPIO canal de facturación (DIRECT o RESELLER),
 * ya que un mismo cliente puede tener un servicio directo y otro vía revendedor.
 *
 * Ej: cliente con Private Office (directo) + Virtual Office (revendedor Alliance).
 */
export default class CreateServiceContracts extends BaseSchema {
  protected tableName = 'service_contracts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('tenant_id').unsigned().notNullable().defaultTo(1).index();

      // Client
      table.integer('client_account_id').unsigned().notNullable()
        .references('id').inTable('client_accounts').onDelete('CASCADE');
      table.index('client_account_id');

      // Service type
      table.integer('service_type_id').unsigned().notNullable()
        .references('id').inTable('service_types').onDelete('RESTRICT');
      table.index('service_type_id');

      // Room/unit (nullable: Virtual Office or event services may not need a room)
      table.integer('rooms_unit_id').unsigned().nullable()
        .references('id').inTable('rooms_units').onDelete('SET NULL');
      table.index('rooms_unit_id');

      // Price (cents). Inherited from room, can be negotiated per contract.
      table.integer('price_cents').unsigned().notNullable().defaultTo(0);

      // ── BILLING CHANNEL (per contract, NOT per client) ──
      // DIRECT = EWS bills client directly
      // RESELLER = EWS bills reseller, reseller re-bills client
      table.enum('billing_channel', ['DIRECT', 'RESELLER'])
        .notNullable().defaultTo('DIRECT');

      // If RESELLER, which reseller handles this service
      table.integer('reseller_id').unsigned().nullable()
        .references('id').inTable('resellers').onDelete('SET NULL');
      table.index('reseller_id');

      // Contract dates
      table.timestamp('started_at', { useTz: true }).notNullable();
      table.timestamp('ended_at', { useTz: true }).nullable();

      // Status
      table.enum('status', ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'])
        .notNullable().defaultTo('ACTIVE');

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
