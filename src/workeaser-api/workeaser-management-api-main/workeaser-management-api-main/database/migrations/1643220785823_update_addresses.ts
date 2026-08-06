import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UpdateAddresses extends BaseSchema {
  protected tableName = 'addresses';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('latitude').nullable().alter();
      table.decimal('longitude').nullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('latitude').notNullable().alter();
      table.decimal('longitude').notNullable().alter();
    });
  }
}
