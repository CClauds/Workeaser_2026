import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { MailboxCoworkingEnum } from 'Contracts/enums';

export default class Mailboxs extends BaseSchema {
  protected tableName = 'mailboxs';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('delivery_id').notNullable();
      table.integer('client_account_id').unsigned().index();
      table.date('delivery_date').notNullable();
      table.string('requested_action').nullable();
      table.string('status').defaultTo(MailboxCoworkingEnum.HOLDING).notNullable();
      table.integer('location_id').unsigned().index();
      table.text('additional_information').nullable();
      table.text('forward_observation').nullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
