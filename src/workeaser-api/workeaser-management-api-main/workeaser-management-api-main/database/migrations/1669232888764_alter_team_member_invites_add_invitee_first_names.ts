import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterTeamMemberInvitesAddInviteeFirstNames extends BaseSchema {
  protected tableName = 'team_member_invites';

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
