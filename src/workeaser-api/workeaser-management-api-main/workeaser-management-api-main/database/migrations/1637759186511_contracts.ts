import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { ContractPaymentStyleEnum, ContractStatusEnum, ContractTermEnum } from 'Contracts/enums';

export default class Contracts extends BaseSchema {
  protected tableName = 'contracts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().index();
      table.integer('client_account_id').unsigned().index();
      table.integer('user_id').unsigned().index();
      table.string('service_type').notNullable();
      table.integer('virtual_office_id').unsigned().index().nullable();
      table.integer('meeting_room_id').unsigned().index().nullable();
      table.integer('shared_desk_id').unsigned().index().nullable();
      table.integer('exclusive_desk_id').unsigned().index().nullable();
      table.integer('private_room_id').unsigned().index().nullable();
      table.string('term_size').defaultTo(ContractTermEnum.MONTH_1).notNullable();
      table.boolean('auto_renewal').defaultTo(true);
      table
        .string('payment_recurring_style')
        .defaultTo(ContractPaymentStyleEnum.MONTHLY)
        .notNullable();
      table.integer('amount').unsigned().notNullable();
      table.integer('recurring_invoice_day');
      table.integer('recurring_invoice_month');
      table.integer('cowork_usage_per_month').unsigned();
      table.integer('meeting_room_usage_per_month').unsigned();
      table.string('status').defaultTo(ContractStatusEnum.CREATED).notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
