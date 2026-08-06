import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPhoneEmailAndPhotoIdCoworkAccounts extends BaseSchema {
  protected tableName = 'cowork_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email').nullable().after('name');
      table.string('phone').nullable().after('email');
      table.integer('photo_id').unsigned().index().nullable().after('phone');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('photo_id');
      table.dropColumn('phone');
      table.dropColumn('email');
    });
  }
}
