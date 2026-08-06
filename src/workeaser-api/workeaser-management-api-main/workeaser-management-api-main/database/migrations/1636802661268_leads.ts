import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { LeadStatusEnum } from 'Contracts/enums';

export default class Leads extends BaseSchema {
  protected tableName = 'leads';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('cowork_account_id').unsigned().index();
      table.integer('client_account_id').unsigned().index();
      table.string('status').defaultTo(LeadStatusEnum.OPPORTUNITY);
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
