import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B2: Catálogo de tipos de servicio.
 * Pricing logic type: RECURRING=por contrato, HOURLY=por hora con mínimo, ON_DEMAND=evento.
 */
export default class CreateServiceTypes extends BaseSchema {
  protected tableName = 'service_types';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('tenant_id').unsigned().notNullable().defaultTo(1).index();

      table.string('name', 100).notNullable();
      table.string('slug', 80).notNullable().unique();
      table.text('description').nullable();

      // Pricing logic: recurring, hourly, on_demand
      table.enum('pricing_logic', ['RECURRING', 'HOURLY', 'ON_DEMAND'])
        .notNullable().defaultTo('RECURRING');

      table.boolean('is_active').notNullable().defaultTo(true);

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });

    // Seed the base service types
    this.defer(async (db) => {
      const now = db.raw('NOW()');
      await db.table(this.tableName).multiInsert([
        { tenant_id: 1, name: 'Private Office', slug: 'private_office', pricing_logic: 'RECURRING', created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Virtual Office', slug: 'virtual_office', pricing_logic: 'RECURRING', created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Meeting Room', slug: 'meeting_room', pricing_logic: 'HOURLY', created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Auditorium', slug: 'auditorium', pricing_logic: 'HOURLY', created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Open Desk', slug: 'open_desk', pricing_logic: 'RECURRING', created_at: now, updated_at: now },
        { tenant_id: 1, name: 'Event On-Demand', slug: 'event_on_demand', pricing_logic: 'ON_DEMAND', created_at: now, updated_at: now },
      ]);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
