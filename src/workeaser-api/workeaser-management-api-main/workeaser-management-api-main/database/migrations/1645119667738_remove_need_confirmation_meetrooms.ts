import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class RemoveNeedConfirmationMeetrooms extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('need_confirmation');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('need_confirmation');
    });
  }
}
