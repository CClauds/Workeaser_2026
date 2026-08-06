import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { MailboxClientEnum } from 'Contracts/enums';

export default class UpdateRequestedActionMailboxes extends BaseSchema {
  protected tableName = 'mailboxes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .string('requested_action')
        .defaultTo(MailboxClientEnum.HOLD_LOCATION)
        .notNullable()
        .alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('requested_action').nullable().alter();
    });
  }
}
