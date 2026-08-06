import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddEnvelopeIdContracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('envelope_id');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('envelope_id');
    });
  }
}
