import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangePriceMeetroomSchemas extends BaseSchema {
  protected tableName = 'meetrooms';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('price').unsigned().notNullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('price').alter();
    });
  }
}
