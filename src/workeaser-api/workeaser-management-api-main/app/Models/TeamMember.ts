import { DateTime } from 'luxon';
import { BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm';
import Team from 'App/Models/Team';
import Location from 'App/Models/Location';
import ClientAccount from 'App/Models/ClientAccount';
import SoftDeleteBaseModel from 'App/Models/SoftDeleteBaseModel';

export default class TeamMember extends SoftDeleteBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public clientAccountId: number;

  @belongsTo(() => ClientAccount)
  public clientAccount: BelongsTo<typeof ClientAccount>;

  @column()
  public teamId: number;

  @belongsTo(() => Team)
  public team: BelongsTo<typeof Team>;

  @manyToMany(() => Location, {
    pivotTable: 'team_member_locations'
  })
  public locations: ManyToMany<typeof Location>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
