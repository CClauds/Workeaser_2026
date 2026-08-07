import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B3: Campos adicionales de cliente (autorizados por Claudio).
 * - address: dirección estructurada US (JSON o texto libre) — nullable
 * - ein: Employer Identification Number / tax ID — nullable
 * - notes: texto libre para observaciones — nullable
 * Todos con tenant_id (ya existe en la tabla por B2).
 */
export default class AddAddressEinNotesToClientAccounts extends BaseSchema {
  protected tableName = 'client_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('address').nullable().after('pmb_number');
      table.string('ein', 30).nullable().after('address');
      table.text('notes').nullable().after('ein');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notes');
      table.dropColumn('ein');
      table.dropColumn('address');
    });
  }
}
