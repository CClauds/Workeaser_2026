import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env';
import Event from '@ioc:Adonis/Core/Event';
import Database from '@ioc:Adonis/Lucid/Database';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkUser from 'App/Models/CoworkUser';
import EmployeeInvite from 'App/Models/EmployeeInvite';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';
import ApplicationUrls from 'App/Utils/ApplicationUrls';
import { CoworkUserRoleEnum, UserRoleEnum } from 'Contracts/enums';
import Crypto from 'crypto';
import Pick from 'lodash/pick';

export default class EmployeeService {
  static async delete(user: User, userUID: string) {
    const toDeleteUser = await User.findByOrFail('uuid', userUID);

    await CoworkUser.query()
      .where('user_id', toDeleteUser.id)
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('role', CoworkUserRoleEnum.EMPLOYEE)
      .delete();

    return { success: true };
  }

  static async list(user: User, filters: any, paginate = true, page = 1) {
    await user.load('coworkUser');

    const query = User.query()
      .preload('photo')
      .whereHas('coworkUser', (coworkUserQuery) => {
        coworkUserQuery.where('cowork_account_id', user.coworkUser.coworkAccountId);
      });

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

  static async show(id: number, user: User) {
    const employee = await User.findOrFail(id);

    await user.load('coworkUser');
    await employee.load('coworkUser');
    await employee.load('photo');

    if (user.coworkUser.coworkAccountId !== employee.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'User not found');
    }

    return user;
  }

  static async sendInvite(user: User, data: any = {}) {
    await user.load('coworkUser');

    if (user.coworkUser.role !== CoworkUserRoleEnum.MANAGER) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const searchUser = await User.query().where('email', data.email).first();

    if (searchUser) {
      const searchCoworkUser = await CoworkUser.query().where('user_id', searchUser.id).first();

      if (searchCoworkUser) {
        throw new AppError(AppError.VALIDATION_FAIL, 'User is already part of a coworking');
      }
    }

    const employeeData = {
      ...Pick(data, EmployeeInvite.fillable),
      token: Crypto.randomBytes(20).toString('hex'),
      coworkAccountId: user?.coworkUser.coworkAccountId
    };

    const trx = await Database.transaction();

    try {
      await EmployeeInvite.query().where('email', data.email).delete();

      const employeeInvite = await new EmployeeInvite()
        .merge(employeeData)
        .useTransaction(trx)
        .save();

      if (data.locations) {
        const locations = data.locations.map((p) => p.id);
        await employeeInvite.related('locations').attach(locations);
      }

      if (data.capabilities) {
        const capabilities = data.capabilities.map((p) => p.id);
        await employeeInvite.related('capabilities').attach(capabilities);
      }

      await trx.commit();

      await this.sendInviteEmail(user, user.coworkUser.coworkAccountId, employeeInvite.id);

      Event.emit('employee_invite:new', { id: employeeInvite.id });

      return employeeInvite;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async listInvites(user: User) {
    await user.load('coworkUser');

    if (user.coworkUser.role !== CoworkUserRoleEnum.MANAGER) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invites = await EmployeeInvite.query().where(
      'cowork_account_id',
      user.coworkUser.coworkAccountId
    );

    return invites?.map((invite) =>
      invite.serialize({
        fields: {
          omit: ['token']
        }
      })
    );
  }

  static async cancelInvite(uuid: string, user: User) {
    await user.load('coworkUser');

    const invite = await EmployeeInvite.findByOrFail('uuid', uuid);

    if (invite.coworkAccountId !== user.coworkUser.coworkAccountId) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid invite');
    }

    this.cancelInviteEmail(user.coworkUser.coworkAccountId, invite);

    await invite.delete();
    Event.emit('employee_invite:delete', { uuid });
  }

  static async showInvite(token: string) {
    const invite = await EmployeeInvite.findByOrFail('token', token);

    await invite.load('coworkAccount');
    await invite.load('capabilities');
    await invite.load('locations');

    const inviteJson = invite.toJSON();

    const searchUser = await User.query().where('email', invite.email).first();

    inviteJson.userExists = !!searchUser;

    return inviteJson;
  }

  static async acceptInvite(token: string, data: any = {}) {
    const invite = await EmployeeInvite.findByOrFail('token', token);
    await invite.load('locations');
    await invite.load('capabilities');

    const trx = await Database.transaction();

    try {
      const searchIfUserExists = await User.findBy('email', invite.email);

      let user: User;

      if (searchIfUserExists) {
        // If the user is already registered on the platform
        user = searchIfUserExists;

        const searchCoworkUser = await CoworkUser.query().where('user_id', user.id).first();

        if (searchCoworkUser) {
          throw new AppError(AppError.VALIDATION_FAIL, 'The user is already part of a coworking');
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
            role: UserRoleEnum.COWORKING
          },
          {
            client: trx
          }
        );
      }

      const newCoworkUser = await CoworkUser.create(
        {
          userId: user.id,
          coworkAccountId: invite.coworkAccountId,
          role: CoworkUserRoleEnum.EMPLOYEE
        },
        {
          client: trx
        }
      );

      const capabilites = await invite.capabilities.map((module) => module.id);
      await newCoworkUser
        .useTransaction(trx)
        .related('coworkModules')
        .sync(capabilites || []);

      const locations = await invite.locations.map((location) => location.id);
      await newCoworkUser
        .useTransaction(trx)
        .related('employeeLocations')
        .sync(locations || []);

      await invite.useTransaction(trx).delete();

      await trx.commit();
      return user;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  private static async sendInviteEmail(user: User, cowork_account_id: number, id: number) {
    const invite = await EmployeeInvite.findOrFail(id);
    const coworkAccount = await CoworkAccount.findOrFail(cowork_account_id);

    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(invite.email)
        .subject(`You have been invited to join ${coworkAccount.name}`)
        .htmlView('emails/coworking/employee_invite', {
          ...invite.toJSON(),
          invitee_first_name: invite.invitee_first_name,
          invitors_first_name: user.firstName,
          invitors_company_name: coworkAccount.name,
          token: `${ApplicationUrls.AUTH.SIGNUP_EMPLOYEE_INVITE}${invite.token}`
        });
    });
  }

  private static async cancelInviteEmail(cowork_account_id: number, invite: EmployeeInvite) {
    const coworkAccount = await CoworkAccount.findOrFail(cowork_account_id);

    Mail.send((message) => {
      message
        .from(Env.get('SES_MAIL_FROM'), Env.get('SES_MAIL_FROM_NAME'))
        .to(invite.email)
        .subject(`Access revoked on ${coworkAccount.name}`)
        .htmlView('emails/coworking/revoke_employee_access', {
          ...invite.toJSON(),
          invitee_first_name: invite.invitee_first_name,
          invitors_company_name: coworkAccount.name
        });
    });
  }
}
