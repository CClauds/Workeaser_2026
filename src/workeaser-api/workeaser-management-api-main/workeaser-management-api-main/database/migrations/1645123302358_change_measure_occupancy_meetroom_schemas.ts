import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeMeasureOccupancyMeetroomSchemas extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('measure_occupancy').unsigned().notNullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('measure_occupancy').alter();
    });
  }
}
