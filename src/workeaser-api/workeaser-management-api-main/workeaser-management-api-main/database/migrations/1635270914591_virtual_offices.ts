import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class VirtualOffices extends BaseSchema {
  protected tableName = 'virtual_offices';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('location_id').unsigned().index();
      table.string('name');
      table.text('description');
      table.boolean('has_dir_listing');
      table.boolean('has_mailing');
      table.boolean('has_phone_answer');
      table.boolean('has_voip');
      table.integer('coworking_usage_mo');
      table.integer('meetroom_usage_mo');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
