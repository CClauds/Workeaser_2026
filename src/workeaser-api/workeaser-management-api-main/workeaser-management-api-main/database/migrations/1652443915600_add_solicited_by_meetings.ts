import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { MeetingSolicitedByEnum } from 'Contracts/enums';

export default class AddSolicitedByMeetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('solicited_by').defaultTo(MeetingSolicitedByEnum.CLIENT);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('solicited_by');
    });
  }
}
