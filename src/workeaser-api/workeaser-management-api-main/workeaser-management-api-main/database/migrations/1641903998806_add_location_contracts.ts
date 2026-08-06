import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddLocationContracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('location_id').unsigned().index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('location_id');
    });
  }
}
