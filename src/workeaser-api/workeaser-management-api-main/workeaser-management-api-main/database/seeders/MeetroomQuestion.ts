import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import MeetroomQuestion from 'App/Models/MeetroomQuestion';
import { MeetroomQuestionSlugs } from 'Contracts/enums';

export default class MeetroomQuestionSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'question';
    await MeetroomQuestion.updateOrCreateMany(uniqueKey, [
      {
        question: 'Do you offer a whiteboard?',
        slug: MeetroomQuestionSlugs.WHITEBOARD
      },
      {
        question: 'Do you offer a Presentation Display?',
        slug: MeetroomQuestionSlugs.PRESENTATION_PROJECTOR
      },
      {
        question: 'Is it permitted to drink?',
        slug: MeetroomQuestionSlugs.DRINK_IN_THE_ROOM
      },
      {
        question: 'Is it permitted to eat?',
        slug: MeetroomQuestionSlugs.EAT_IN_THE_ROOM
      },
      {
        question: 'Is the space ADA Compliant?',
        slug: MeetroomQuestionSlugs.ADA_COMPLIANT
      },
      {
        question: 'Do you offer Multimedia Connectors & Adaptors?',
        slug: MeetroomQuestionSlugs.MULTIMEDIA_CONNECTORS
      },
      {
        question: 'Do you offer Office Supplies?',
        slug: MeetroomQuestionSlugs.OFFICE_SUPPLIES
      }
    ]);
  }
}
