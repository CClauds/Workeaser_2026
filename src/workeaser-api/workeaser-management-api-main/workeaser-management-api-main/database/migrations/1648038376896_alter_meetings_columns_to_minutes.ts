import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterMeetingsColumnsToMinutes extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('quantity_hours', 'quantity_minutes');
      table.renameColumn('amount_hours', 'price_per_hour');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('quantity_minutes', 'quantity_hours');
      table.renameColumn('price_per_hour', 'amount_hours');
    });
  }
}
