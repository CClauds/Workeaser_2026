import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddDiscountStructureMeetrooms extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('discount_three').unsigned().notNullable();
      table.integer('discount_half').unsigned().notNullable();
      table.integer('discount_full').unsigned().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('discount_three');
      table.dropColumn('discount_half');
      table.dropColumn('discount_full');
    });
  }
}
