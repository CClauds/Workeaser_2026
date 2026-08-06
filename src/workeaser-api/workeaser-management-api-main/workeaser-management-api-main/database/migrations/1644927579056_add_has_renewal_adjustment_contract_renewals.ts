import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddHasRenewalAdjustmentContractRenewals extends BaseSchema {
  protected tableName = 'contract_renewals';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('has_renewal_adjustment').defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('has_renewal_adjustment');
    });
  }
}
