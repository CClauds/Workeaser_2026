import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddMeetroomQuestionSlugs extends BaseSchema {
  protected tableName = 'meetroom_questions';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug').index();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug');
    });
  }
}
