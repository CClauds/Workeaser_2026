import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Desks extends BaseSchema {
  protected tableName = 'desks';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('location_id').unsigned().index();
      table.string('name');
      table.text('description');
      table.boolean('shareable');
      table.integer('quantity');
      table.integer('minimum_rental_period');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
