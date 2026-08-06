import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddNextCursorLinkedBankAccounts extends BaseSchema {
  protected tableName = 'linked_bank_accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('next_cursor').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('next_cursor');
    });
  }
}
