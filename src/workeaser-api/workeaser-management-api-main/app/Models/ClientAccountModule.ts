import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Team from 'App/Models/Team';
import ClientModule from 'App/Models/ClientModule';
import ClientAccount from 'App/Models/ClientAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class ClientAccountModule extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public clientAccountId: number;

  @belongsTo(() => ClientAccount)
  public clientAccount: BelongsTo<typeof ClientAccount>;

  @column()
  public clientModuleId: number;

  @belongsTo(() => ClientModule)
  public clientModule: BelongsTo<typeof ClientModule>;

  @column()
  public teamId: number;

  @belongsTo(() => Team)
  public team: BelongsTo<typeof Team>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
