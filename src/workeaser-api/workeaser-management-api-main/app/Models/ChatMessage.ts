import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';
import Chat from './Chat';

export enum SentByEnum {
  CLIENT = 'CLIENT',
  COWORK = 'COWORK'
}
export default class ChatMessage extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column({ serializeAs: null })
  public fromUserId: number;

  @column()
  public message: string;

  @column()
  public sentBy: SentByEnum;

  @column()
  public isRead: boolean;

  @column({ serializeAs: null })
  public chatId: number;

  @belongsTo(() => Chat)
  public chat: BelongsTo<typeof Chat>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
