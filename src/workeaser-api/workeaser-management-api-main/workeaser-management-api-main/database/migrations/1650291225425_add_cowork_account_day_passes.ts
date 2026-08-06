import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddCoworkAccountDayPasses extends BaseSchema {
  protected tableName = 'day_passes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cowork_account_id').index().unsigned().notNullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cowork_account_id');
    });
  }
}
