import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { ContractTermEnum } from 'Contracts/enums';

export default class ChangeDurationDeskPrices extends BaseSchema {
  protected tableName = 'desk_prices';

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
      table.integer('duration').alter();
    });
  }
}
