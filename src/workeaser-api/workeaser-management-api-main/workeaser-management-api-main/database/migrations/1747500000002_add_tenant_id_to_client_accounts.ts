import BaseSchema from '@ioc:Adonis/Lucid/Schema';

/**
 * B2: Agrega tenant_id y campos de contacto a client_accounts.
 * Reusa la tabla existente con 240 clientes importados de QBO.
 */
export default class AddTenantIdToClientAccounts extends BaseSchema {
  protected tableName = 'client_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('tenant_id').unsigned().defaultTo(1).after('id');
      table.index('tenant_id');

      // Contacto primario del cliente (independiente del user vinculado)
      table.string('contact_first_name', 100).nullable().after('company_phone');
      table.string('contact_last_name', 100).nullable().after('contact_first_name');
      table.string('contact_email', 255).nullable().after('contact_last_name');
      table.string('contact_phone', 50).nullable().after('contact_email');

      // PMB (Private Mailbox) number — usado en buzón virtual
      table.string('pmb_number', 20).nullable().after('contact_phone');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pmb_number');
      table.dropColumn('contact_phone');
      table.dropColumn('contact_email');
      table.dropColumn('contact_last_name');
      table.dropColumn('contact_first_name');
      table.dropIndex('tenant_id');
      table.dropColumn('tenant_id');
    });
  }
}
