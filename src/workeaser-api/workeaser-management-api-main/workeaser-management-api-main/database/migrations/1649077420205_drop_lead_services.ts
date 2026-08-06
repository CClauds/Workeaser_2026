import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class DropLeadServices extends BaseSchema {
  protected tableName = 'lead_services';

  public async up() {
    this.schema.dropTable(this.tableName);
  }

  public async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('lead_id').unsigned().index();
      table.integer('service_id').unsigned().index();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }
}
