import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPhoneEmailLocations extends BaseSchema {
  protected tableName = 'locations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email');
      table.string('phone');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email');
      table.dropColumn('phone');
    });
  }
}
