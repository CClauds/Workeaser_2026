import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B2: Salas/unidades unificadas (modelo "Venus 101").
 * Reemplaza conceptualmente virtual_offices, meetrooms, desks, rooms.
 * Cada sala pertenece a una location (center) y tiene un service_type.
 */
export default class CreateRoomsUnits extends BaseSchema {
  protected tableName = 'rooms_units';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('tenant_id').unsigned().notNullable().defaultTo(1).index();

      // Center
      table.integer('location_id').unsigned().notNullable()
        .references('id').inTable('locations').onDelete('CASCADE');
      table.index('location_id');

      // Service type
      table.integer('service_type_id').unsigned().notNullable()
        .references('id').inTable('service_types').onDelete('RESTRICT');
      table.index('service_type_id');

      // Room identifiers
      table.string('room_number', 20).notNullable();         // ej. "101"
      table.string('display_name', 255).notNullable();       // ej. "Venus 101"
      table.text('description').nullable();

      // Physical attributes
      table.integer('size_sqft').unsigned().nullable();      // square feet
      table.integer('capacity').unsigned().nullable();       // max occupants

      // Pricing (base price of the room — flows to contracts)
      table.integer('base_price_cents').unsigned().notNullable().defaultTo(0);

      // Status
      table.boolean('is_active').notNullable().defaultTo(true);
      table.boolean('is_available').notNullable().defaultTo(true);

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
