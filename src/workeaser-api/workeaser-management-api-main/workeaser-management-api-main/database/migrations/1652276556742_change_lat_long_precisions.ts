import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeLatLongPrecisions extends BaseSchema {
  protected tableName = 'addresses';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('latitude', 9, 6).alter();
      table.float('longitude', 9, 6).alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('latitude', 8, 2).alter();
      table.float('longitude', 8, 2).alter();
    });
  }
}
