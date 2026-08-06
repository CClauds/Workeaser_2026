import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterRoomsAddIsDaypassEnables extends BaseSchema {
  protected tableName = 'rooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_daypass_enabled').defaultTo(true);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_daypass_enabled');
    });
  }
}
