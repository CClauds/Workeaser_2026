import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Cards extends BaseSchema {
  protected tableName = 'cards';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('user_id').unsigned().index();
      table.string('gateway_id').notNullable();
      table.string('integration_service').notNullable().index();
      table.string('cardholder_name').notNullable();
      table.string('brand').notNullable();
      table.string('country').nullable();
      table.integer('exp_month').notNullable();
      table.integer('exp_year').notNullable();
      table.string('last_digits').notNullable();
      table.string('funding').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
      table.timestamp('deleted_at', { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
