import AppError from 'App/Utils/AppError';
import LogService from 'App/Services/LogService';
import TeamService from 'App/Services/Client/TeamService';
import AcceptInviteValidator from 'App/Validators/Client/Team/AcceptInviteValidator';
import StoreTeamMemberInviteValidator from 'App/Validators/Client/Team/StoreTeamMemberInviteValidator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class TeamMembersController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const filters = request.all();
    const paginate = request.input('paginate', true);
    const page = request.input('page', 1);

    const results = await TeamService.listMembers(user, filters, paginate, page);

    return responseWithPagination(response, results);
  }

  async listInvites({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await TeamService.listInvites(user);

    return responseWithSuccess(response, results);
  }

  async showInvite({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const token = request.param('token');
    const invite = await TeamService.showInvite(token);

    return responseWithSuccess(response, invite);
  }

  async acceptInvite({ request, response, params, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(AcceptInviteValidator);

    const invite = await TeamService.acceptInvite({ ...payload, token: params.token });
    await LogService.create(auth.user as any, 'TEAMS', 'INVITE_ACCEPT', invite.id);

    return responseWithSuccess(response, invite);
  }

  async sendInvite({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreTeamMemberInviteValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invite = await TeamService.sendInvite(user, payload);

    await LogService.create(auth.user as any, 'TEAMS', 'INVITE_SENT', invite.id);

    return responseWithSuccess(response);
  }

  async cancelInvite({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await TeamService.cancelInviteMember(params.id, user);
    await LogService.create(auth.user as any, 'TEAMS', 'INVITE_CANCEL', params.id);

    return responseWithSuccess(response);
  }
}
