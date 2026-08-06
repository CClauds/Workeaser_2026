import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterInitialFeesAddDeletedAts extends BaseSchema {
  protected tableName = 'initial_fees';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }
}
