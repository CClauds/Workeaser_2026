import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm';
import ClientAccount from 'App/Models/ClientAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class Team extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public clientAccountId: number;

  @belongsTo(() => ClientAccount)
  public clientAccount: BelongsTo<typeof ClientAccount>;

  @manyToMany(() => ClientAccount, {
    pivotTable: 'team_members'
  })
  public members: ManyToMany<typeof ClientAccount>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
