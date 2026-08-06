import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Meetroom from 'App/Models/Meetroom';
import MeetroomQuestion from 'App/Models/MeetroomQuestion';

export default class MeetroomAnswer extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public meetroomId: number;

  @belongsTo(() => Meetroom)
  public meetroom: BelongsTo<typeof Meetroom>;

  @column()
  public meetroomQuestionId: number;

  @belongsTo(() => MeetroomQuestion)
  public meetroomQuestion: BelongsTo<typeof MeetroomQuestion>;

  @column()
  public answer: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
