import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveDueDateContracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('due_date');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('due_date');
    });
  }
}
