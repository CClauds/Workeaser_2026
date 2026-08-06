import { DateTime } from 'luxon';
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  ManyToMany,
  manyToMany
} from '@ioc:Adonis/Lucid/Orm';
import Team from 'App/Models/Team';
import Location from 'App/Models/Location';
import ClientModule from 'App/Models/ClientModule';

export default class TeamMemberInvite extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public token: string;

  @column()
  public teamId: number;

  @belongsTo(() => Team)
  public team: BelongsTo<typeof Team>;

  @column()
  public email: string;

  @manyToMany(() => ClientModule, {
    pivotTable: 'team_member_invite_capabilities'
  })
  public capabilities: ManyToMany<typeof ClientModule>;

  @manyToMany(() => Location, {
    pivotTable: 'team_member_invite_locations'
  })
  public locations: ManyToMany<typeof Location>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public invitee_first_name: string;

  static get fillable() {
    return ['token', 'email', 'invitee_first_name'];
  }
}
