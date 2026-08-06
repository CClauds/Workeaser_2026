import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddNicknameWallets extends BaseSchema {
  protected tableCardsName = 'cards';
  protected tableBankAccountName = 'bank_accounts';

  public async up() {
    this.schema.alterTable(this.tableCardsName, (table) => {
      table.string('nickname').nullable();
    });

    this.schema.alterTable(this.tableBankAccountName, (table) => {
      table.string('nickname').nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableCardsName, (table) => {
      table.dropColumn('nickname');
    });

    this.schema.alterTable(this.tableBankAccountName, (table) => {
      table.dropColumn('nickname');
    });
  }
}
