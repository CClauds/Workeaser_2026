import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Mailbox from 'App/Models/Mailbox';

export default class MailboxHistory extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({ serializeAs: null })
  public mailboxId: number;

  @belongsTo(() => Mailbox)
  public mailbox: BelongsTo<typeof Mailbox>;

  @column()
  public status: string;

  @column()
  public message: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
