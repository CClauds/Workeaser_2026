import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ClientAccounts extends BaseSchema {
  protected tableName = 'client_accounts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');

      table.integer('user_id').unsigned().index();
      table.string('personal_phone').nullable();
      table.integer('personal_address_id').unsigned().index();
      table.integer('personal_photo_id').unsigned().index().nullable();
      table.string('company_name').nullable();
      table.string('company_email').nullable();
      table.string('company_phone').nullable();
      table.integer('company_address_id').unsigned().index().nullable();
      table.integer('company_photo_id').unsigned().index().nullable();

      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
