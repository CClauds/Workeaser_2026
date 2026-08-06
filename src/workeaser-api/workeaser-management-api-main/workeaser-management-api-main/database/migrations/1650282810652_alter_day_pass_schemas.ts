import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterDayPassSchemas extends BaseSchema {
  protected tableName = 'day_passes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('user_type').index();
      table.integer('client_id').unsigned().index();
      table.string('payment_method').nullable();
      table.integer('invoice_id').unsigned().nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('user_type', 'client_id', 'payment_method', 'invoice_id');
    });
  }
}
