import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { DayPassSolicitedByEnum } from 'Contracts/enums';

export default class AddSolicitedByDayPasses extends BaseSchema {
  protected tableName = 'day_passes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('solicited_by').defaultTo(DayPassSolicitedByEnum.CLIENT);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('solicited_by');
    });
  }
}
