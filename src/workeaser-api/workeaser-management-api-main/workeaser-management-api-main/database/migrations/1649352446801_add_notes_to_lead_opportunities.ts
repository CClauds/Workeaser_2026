import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddNotesToLeadOpportunities extends BaseSchema {
  protected tableName = 'lead_opportunities';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('notes').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notes');
    });
  }
}
