import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class LocationServices extends BaseSchema {
  protected tableName = 'location_services';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('location_id').unsigned().index();
      table.integer('service_id').unsigned().index();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
