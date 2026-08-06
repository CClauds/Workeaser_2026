import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UpdateDeliveryIdMailboxes extends BaseSchema {
  protected tableName = 'mailboxes';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('delivery_id').nullable().alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('delivery_id').notNullable().alter();
    });
  }
}
