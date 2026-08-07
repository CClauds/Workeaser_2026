import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B2: Revendedores/carteras (resellers/portfolios).
 * Ej: EWS VO Diretos, Alliance Virtual, DaVinci, Hutter, Nelma, Sergio Souza.
 */
export default class CreateResellers extends BaseSchema {
  protected tableName = 'resellers';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('tenant_id').unsigned().notNullable().defaultTo(1).index();

      table.string('name', 255).notNullable();
      table.string('slug', 100).notNullable().unique();
      table.string('contact_name', 255).nullable();
      table.string('contact_email', 255).nullable();
      table.string('contact_phone', 50).nullable();

      // Commission rate in basis points (500 = 5.00%)
      table.integer('commission_bps').unsigned().notNullable().defaultTo(0);
      table.text('notes').nullable();

      table.boolean('is_active').notNullable().defaultTo(true);

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });

    // Seed default resellers
    this.defer(async (db) => {
      const now = db.raw('NOW()');
      await db.table(this.tableName).multiInsert([
        { tenant_id: 1, name: 'EWS VO Direct', slug: 'ews_vo_direct', commission_bps: 0, created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Alliance Virtual', slug: 'alliance_virtual', commission_bps: 0, created_at: now, updated_at: now },
        { tenant_id: 1, name: 'DaVinci', slug: 'davinci', commission_bps: 0, created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Hutter', slug: 'hutter', commission_bps: 0, created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Nelma', slug: 'nelma', commission_bps: 0, created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Sergio Souza', slug: 'sergio_souza', commission_bps: 0, created_at: now, updated_at: now },
      ]);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
