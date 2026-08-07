import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B2: Agrega tenant_id a locations (centers).
 * Reusa la tabla existente — los 10 centros de EWS son el tenant 1.
 */
export default class AddTenantIdToLocations extends BaseSchema {
  protected tableName = 'locations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('tenant_id').unsigned().defaultTo(1).after('id');
      table.index('tenant_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('tenant_id');
      table.dropColumn('tenant_id');
    });
  }
}
