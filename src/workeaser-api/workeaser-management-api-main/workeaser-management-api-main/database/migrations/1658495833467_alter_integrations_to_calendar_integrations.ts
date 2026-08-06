import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterIntegrationsToCalendarIntegrations extends BaseSchema {
  protected oldTableName = 'integrations';
  protected newTableName = 'calendar_integrations';

  public async up() {
    this.schema.renameTable(this.oldTableName, this.newTableName);
  }

  public async down() {
    this.schema.renameTable(this.newTableName, this.oldTableName);
  }
}
