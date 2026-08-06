import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterEmployeeInvitesAddInviteeFirstNames extends BaseSchema {
  protected tableName = 'employee_invites';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('invitee_first_name');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('invitee_first_name');
    });
  }
}
