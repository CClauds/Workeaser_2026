import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class EmployeeInviteCapabilities extends BaseSchema {
  protected tableName = 'employee_invite_capabilities';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('employee_invite_id').unsigned().index();
      table.integer('cowork_module_id').unsigned().index();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
