import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class LeadOpportunities extends BaseSchema {
  protected tableName = 'lead_opportunities';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('lead_id').unsigned().nullable().index();
      table.integer('service_id').unsigned().nullable().index();
      table.string('status');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
