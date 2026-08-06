import { ClientType } from 'Contracts/enums';
import User from 'App/Models/User';
import Team from 'App/Models/Team';
import TeamMember from 'App/Models/TeamMember';
import ClientModule from 'App/Models/ClientModule';
import ClientAccountModule from 'App/Models/ClientAccountModule';

export default class ClientAuthorizationService {
  static async userHasPermissionToAccessModule(
    userId: number,
    modules?: string[]
  ): Promise<boolean> {
    if (!modules) {
      return false;
    }

    const user = await User.findOrFail(userId);
    await user.load('clientAccount');
    const team = await ClientAuthorizationService.getClientTeam(user.clientAccount.id);

    const modulesId = (await ClientModule.query().whereIn('slug', modules)).map(
      (module) => module.id
    );

    const searchUserModules = await ClientAccountModule.query()
      .where('client_account_id', user.clientAccount.id)
      .where('team_id', team.id)
      .whereIn('client_module_id', modulesId)
      .count('* as total');

    if (searchUserModules[0].$extras.total) {
      return true;
    }

    return false;
  }

  static async getClientAccountType(clientAccountId: number) {
    const searchTeamOwner = await Team.query()
      .where('client_account_id', clientAccountId)
      .firstOrFail();

    const checkIfTeamHasMembers = await TeamMember.query()
      .where('team_id', searchTeamOwner.id)
      .count('* as total');

    if (checkIfTeamHasMembers[0].$extras.total) {
      return ClientType.MANAGER;
    } else {
      const searchUserIsMember = await TeamMember.query()
        .where('client_account_id', clientAccountId)
        .first();

      if (searchUserIsMember) {
        return ClientType.MEMBER;
      } else {
        return ClientType.INDIVIDUAL;
      }
    }
  }

  static async getClientTeam(clientAccountId: number): Promise<Team> {
    // Check if the user is part of a team.
    const searchUserIsMember: TeamMember = await TeamMember.query()
      .preload('team')
      .where('client_account_id', clientAccountId)
      .first();

    if (searchUserIsMember) {
      return searchUserIsMember.team;
    }

    // If the user is not part of a team, return the individual team.
    const searchTeamOwner: Team = await Team.query()
      .where('client_account_id', clientAccountId)
      .firstOrFail();

    return searchTeamOwner;
  }
}
