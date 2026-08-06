import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddPhotoIdToUsers extends BaseSchema {
  public async up() {
    this.schema.alterTable('users', (table) => {
      table.integer('photo_id').unsigned().index().nullable();
    });

    this.schema.alterTable('client_accounts', (table) => {
      table.dropColumn('personal_photo_id');
    });
  }

  public async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('photo_id');
    });

    this.schema.alterTable('client_accounts', (table) => {
      table.integer('personal_photo_id').unsigned().index().nullable();
    });
  }
}
