import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class TeamMemberInvites extends BaseSchema {
  protected tableName = 'team_member_invites';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('team_id').unsigned().index();
      table.string('token').notNullable();
      table.string('email').notNullable();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
