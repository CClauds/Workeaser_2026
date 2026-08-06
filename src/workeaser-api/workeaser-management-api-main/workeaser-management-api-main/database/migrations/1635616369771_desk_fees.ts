import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class DeskFees extends BaseSchema {
  protected tableName = 'desk_fees';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('desk_id').unsigned().index();
      table.string('name');
      table.text('description');
      table.integer('amount');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
