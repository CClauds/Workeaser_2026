import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterTableCoworkClientsAddUuids extends BaseSchema {
  protected tableName = 'cowork_clients';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('uuid').index();
    });
    this.schema.raw(`UPDATE ${this.tableName} SET uuid=(SELECT uuid()) where uuid is null`);
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uuid');
    });
  }
}
