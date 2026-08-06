import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { MeetingPaymentMethodEnum } from 'Contracts/enums';

export default class AddPaymentMethodMeetings extends BaseSchema {
  protected tableName = 'meetings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('payment_method').defaultTo(MeetingPaymentMethodEnum.BILLING).notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payment_method');
    });
  }
}
