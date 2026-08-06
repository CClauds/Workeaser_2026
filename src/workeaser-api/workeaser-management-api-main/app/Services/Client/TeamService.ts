import Env from '@ioc:Adonis/Core/Env';
import Mail from '@ioc:Adonis/Addons/Mail';
import User from 'App/Models/User';
import Team from 'App/Models/Team';
import Event from '@ioc:Adonis/Core/Event';
import Crypto from 'crypto';
import Address from 'App/Models/Address';
import AppError from 'App/Utils/AppError';
import Database from '@ioc:Adonis/Lucid/Database';
import TeamMember from 'App/Models/TeamMember';
import ClientAccount from 'App/Models/ClientAccount';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import TeamMemberInvite from 'App/Models/TeamMemberInvite';
import NotificationsService from 'App/Services/NotificationsService';
import TeamMemberInviteLocation from 'App/Models/TeamMemberInviteLocation';
import TeamMemberInviteCapability from 'App/Models/TeamMemberInviteCapability';
import ClientAuthorizationService from 'App/Services/Client/ClientAuthorizationService';
import { ClientType, NotificationTypeEnum, UserRoleEnum } from 'Contracts/enums';

export default class TeamService {
  static async listMembers(user: User, filters: any, paginate = true, page = 1) {
    await user.load('clientAccount');
    await user.clientAccount.load('team');

    const teamMembers = await TeamMember.query()
      .where('team_id', user.clientAccount.team.id)
      .preload('clientAccount');

    const userIds = teamMembers.map((member) => member.clientAccount.userId);

    const query = User.query().whereIn('id', userIds).preload('clientAccount').preload('photo');

    if (filters.name) {
      query
        .where('first_name', 'like', `%${filters.name}%`)
        .orWhere('last_name', 'like', `%${filters.name}%`);
    }

    if (filters.email) {
      query.where('email', 'like', `%${filters.email}%`);
    }

    return (await paginate) ? query.paginate(page, Env.get('ITEMS_PER_PAGE')) : query;
  }

  static async listInvites(user: User) {
    await user.load('clientAccount');
    await user.clientAccount.load('team');

    const accountType = await ClientAuthorizationService.getClientAccountType(
      user.clientAccount.id
    );

    if (![ClientType.MANAGER, ClientType.INDIVIDUAL].includes(accountType)) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invites = await TeamMemberInvite.query().where('team_id', user.clientAccount.team.id);

    return invites;
  }

  static async sendInvite(user: User, data: any = {}): Promise<TeamMemberInvite> {
    await user.load('clientAccount');
    await user.clientAccount.load('team');

    const accountType = await ClientAuthorizationService.getClientAccountType(
      user.clientAccount.id
    );

    if (![ClientType.MANAGER, ClientType.INDIVIDUAL].includes(accountType)) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    // Search if the user already registered
    const searchUser = await User.query()
      .where('email', data.email)
      .preload('clientAccount')
      .first();

    if (searchUser) {
      // Search if the user is already a member of a team
      const searchTeamMember = await TeamMember.query()
        .where('client_account_id', searchUser.clientAccount.id)
        .first();

      if (searchTeamMember) {
        throw new AppError(AppError.VALIDATION_FAIL, 'User is already part of a team');
      }
    }

    const inviteData = {
      email: data.email,
      token: Crypto.randomBytes(20).toString('hex'),
      teamId: user?.clientAccount.team.id,
      invitee_first_name: data.invitee_first_name
    };

    const trx = await Database.transaction();

    try {
      await TeamMemberInvite.query().where('email', data.email).delete();

      const teamInvite = await new TeamMemberInvite().merge(inviteData).useTransaction(trx).save();

      if (data.locations) {
        const locations = data.locations.map((p) => p.id);
        await teamInvite.related('locations').attach(locations);
      }

      if (data.capabilities) {
        const capabilities = data.capabilities.map((p) => p.id);
        await teamInvite.related('capabilities').attach(capabilities);
      }

      await trx.commit();
      await this.sendInviteEmail(user, teamInvite.id);

      Event.emit('team_member_invite:new', { id: teamInvite.id });

      return teamInvite;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async cancelInviteMember(id: number, user: User) {
    await user.load('clientAccount');
    await user.clientAccount.load('team');

    const accountType = await ClientAuthorizationService.getClientAccountType(
      user.clientAccount.id
    );

    if (![ClientType.MANAGER, ClientType.INDIVIDUAL].includes(accountType)) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invite = await TeamMemberInvite.findOrFail(id);

    if (invite.teamId !== user.clientAccount.team.id) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid invite');
    }

    this.cancelInviteEmail(user, invite);

    await invite.delete();
    Event.emit('team_member_invite:delete', { id });
  }

  static async showInvite(token: string) {
    const invite = await TeamMemberInvite.findBy('token', token);

    if (!invite) {
      throw new AppError(AppError.NOT_FOUND, 'Invite not found');
    }

    await invite.load('capabilities');
    await invite.load('team');
    await invite.team.load('clientAccount');
    await invite.load('locations');

    const inviteJson = invite.toJSON();

    const searchUser = await User.query().where('email', invite.email).first();

    inviteJson.userExists = searchUser ? true : false;

    return inviteJson;
  }

  static async acceptInvite(data: any = {}): Promise<User> {
    const invite = await TeamMemberInvite.findByOrFail('token', data.token);
    await invite.load('locations');
    await invite.load('capabilities');

    const trx = await Database.transaction();

    try {
      const searchIfUserExists = await User.query().where('email', invite.email).first();

      const team: Team = await Team.query()
        .where('id', invite.teamId)
        .preload('clientAccount')
        .first();

      if (!team) {
        throw new AppError(AppError.BAD_REQUEST, 'Team is not valid');
      }

      let user: User;
      let clientAccount: ClientAccount;

      if (searchIfUserExists) {
        // If the user is already registered on the platform
        user = searchIfUserExists;

        clientAccount = await ClientAccount.query().where('user_id', user.id).firstOrFail();

        const searchTeamMember = await TeamMember.query()
          .where('client_account_id', clientAccount.id)
          .first();

        if (searchTeamMember) {
          throw new AppError(AppError.VALIDATION_FAIL, 'User is already part of a team');
        }
      } else {
        // If the user isn't registered
        user = await User.create(
          {
            firstName: data.first_name,
            lastName: data.last_name,
            email: invite.email,
            password: data.password,
            emailConfirmed: true,
            role: UserRoleEnum.CLIENT,
            photoId: data.photo_id,
            personalPhone: data.personal_phone
          },
          {
            client: trx
          }
        );

        const newPersonalAddress = await new Address()
          .merge(data.personal_address)
          .useTransaction(trx)
          .save();

        await user.useTransaction(trx).related('personalAddress').associate(newPersonalAddress);

        clientAccount = await ClientAccount.create(
          {
            userId: user.id
          },
          {
            client: trx
          }
        );

        await Team.create(
          {
            clientAccountId: clientAccount.id
          },
          { client: trx }
        );
      }

      const newTeamMember = await TeamMember.create(
        {
          clientAccountId: clientAccount.id,
          teamId: invite.teamId
        },
        {
          client: trx
        }
      );

      const capabilites = {};

      invite.capabilities.forEach((module) => {
        capabilites[module.id] = {
          team_id: invite.teamId
        };
      });

      await clientAccount
        .useTransaction(trx)
        .related('clientModules')
        .sync(capabilites || []);

      const locations = invite.locations.map((location) => location.id);

      await newTeamMember
        .useTransaction(trx)
        .related('locations')
        .sync(locations || []);

      await TeamMemberInviteCapability.query()
        .useTransaction(trx)
        .where('team_member_invite_id', invite.id)
        .delete();

      await TeamMemberInviteLocation.query()
        .useTransaction(trx)
        .where('team_member_invite_id', invite.id)
        .delete();

      await invite.useTransaction(trx).delete();
      await trx.commit();

      await NotificationsService.create({
        title: 'Invitation accepted',
        message: `The invitation sent to ${user.fullName} was accepted`,
        type: NotificationTypeEnum.CLIENT,
        client_id: team.clientAccount.userId
      });

      return user;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  private static async sendInviteEmail(user: User, id: number) {
    const invite = await TeamMemberInvite.findOrFail(id);

    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(invite.email)
        .subject(`You have been invited to join as team member`)
        .htmlView('emails/coworker/newMember/member_addition', {
          ...invite.toJSON(),
          invitee_first_name: invite.invitee_first_name,
          invitors_first_name: user.firstName,
          invitors_last_name: user.lastName,
          client_company: user.clientAccount.companyName,
          token: `${ApplicationUrls.AUTH.SIGNUP_TEAM_MEMBER_INVITE}${invite.token}`
        });
    });
  }

  private static async cancelInviteEmail(user: User, invite: TeamMemberInvite) {
    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(invite.email)
        .subject(`Team member revoked on ` + user.clientAccount.companyName)
        .htmlView('emails/coworker/newMember/revoke_member_access', {
          ...invite.toJSON(),
          invitee_first_name: invite.invitee_first_name,
          client_company: user.clientAccount.companyName
        });
    });
  }
}
