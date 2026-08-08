import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B3-R1-D: Tarifas manuales editables + aumento anual automático (%).
 * ADVERTENCIA: cambio de esquema en service_contracts (reversible).
 */
export default class AddAnnualIncreaseToServiceContracts extends BaseSchema {
  protected tableName = 'service_contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Annual automatic increase percentage (e.g., 5.00 = 5%)
      // Nullable = no automatic increase
      table.decimal('annual_increase_pct', 5, 2).nullable().after('price_cents');

      // Whether the price was manually negotiated (vs inherited from room)
      table.boolean('is_price_negotiated').defaultTo(false).after('annual_increase_pct');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_price_negotiated');
      table.dropColumn('annual_increase_pct');
    });
  }
}
