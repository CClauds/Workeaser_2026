import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPaymentApplicationFeeFlags extends BaseSchema {
  protected tableName = 'payments';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('application_fee').defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('application_fee');
    });
  }
}
