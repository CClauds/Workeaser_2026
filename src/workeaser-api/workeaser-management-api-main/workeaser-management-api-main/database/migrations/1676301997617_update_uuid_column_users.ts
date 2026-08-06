import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UpdateUuidColumnUsers extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.raw(`UPDATE ${this.tableName} SET uuid=(SELECT uuid()) where uuid is null`);
  }

  public async down() {}
}
