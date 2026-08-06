import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { ContractTermEnum } from 'Contracts/enums';

export default class ChangeDurationVirtualOfficePrices extends BaseSchema {
  protected tableName = 'virtual_office_prices';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('duration');
    });

    this.schema.alterTable(this.tableName, (table) => {
      table.string('duration').notNullable().defaultTo(ContractTermEnum.MONTH_1);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('duration');
      table.integer('duration');
    });
  }
}
