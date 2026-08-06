import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { MeetingDiscountTypesEnum } from 'Contracts/enums';

export default class Meetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().notNullable().index();
      table.integer('location_id').unsigned().notNullable().index();
      table.integer('meetroom_id').unsigned().notNullable().index();
      table.integer('user_id').unsigned().notNullable().index();
      table.string('discount_type').defaultTo(MeetingDiscountTypesEnum.NONE);
      table.integer('discount_value');
      table.integer('quantity_hours');
      table.integer('amount_hours');
      table.integer('amount_taxes');
      table.integer('amount_taxes_overdue');
      table.integer('amount_discount');
      table.integer('total_amount');
      table.text('additional_information').nullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
