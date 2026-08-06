import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class SetUserNullablePayments extends BaseSchema {
  protected tableName = 'payments';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').nullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').notNullable().alter();
    });
  }
}
