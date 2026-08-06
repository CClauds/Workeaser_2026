import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveTotalAmountMeetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('total_amount');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('total_amount');
    });
  }
}
