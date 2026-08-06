import BaseSchema from '@ioc:Adonis/Lucid/Schema';
import { LeadStatusEnum } from 'Contracts/enums';

export default class AddDefaultValueStatusLeadOpportunities extends BaseSchema {
  protected tableName = 'lead_opportunities';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status').defaultTo(LeadStatusEnum.OPPORTUNITY).alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status');
    });
  }
}
