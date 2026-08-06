import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UpdateNullablesUuidCoworkUsers extends BaseSchema {
  protected tableName = 'cowork_users';

  public async up() {
    this.schema.raw(`UPDATE ${this.tableName} SET uuid=(SELECT uuid()) where uuid is null`);
  }

  public async down() {}
}
