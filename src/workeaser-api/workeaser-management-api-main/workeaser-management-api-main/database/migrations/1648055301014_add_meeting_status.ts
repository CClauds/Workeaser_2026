import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { MeetingStatusEnum } from 'Contracts/enums';

export default class AddMeetingStatus extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status').defaultTo(MeetingStatusEnum.SOLICITED).notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status');
    });
  }
}
