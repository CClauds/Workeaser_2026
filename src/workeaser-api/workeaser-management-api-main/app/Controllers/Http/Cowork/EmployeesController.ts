import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import EmployeeService from 'App/Services/Cowork/EmployeeService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';
import AcceptInviteValidator from 'App/Validators/Cowork/Employees/AcceptInviteValidator';
import StoreEmployeeInviteValidator from 'App/Validators/Cowork/Employees/StoreEmployeeInviteValidator';

export default class EmployeesController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const filters = request.all();
    const paginate = request.input('paginate', true);
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await EmployeeService.list(user, filters, paginate, page);

    return responseWithPagination(response, results);
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const employee = await EmployeeService.show(params.id, user);

    return responseWithSuccess(response, employee);
  }

  async sendInvite({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreEmployeeInviteValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newInvite = await EmployeeService.sendInvite(user, payload);
    await LogService.create(auth.user as any, 'EMPLOYEE', 'INVITE_SENT', newInvite.id);

    return responseWithSuccess(response, newInvite);
  }

  async listInvites({ response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const invites = await EmployeeService.listInvites(user);

    return responseWithSuccess(response, invites);
  }

  async showInvite({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const token = request.param('token');
    const invite = await EmployeeService.showInvite(token);

    return responseWithSuccess(response, invite);
  }

  async acceptInvite({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(AcceptInviteValidator);
    const token = request.param('token');

    const invite = await EmployeeService.acceptInvite(token, payload);
    await LogService.create(auth.user as any, 'EMPLOYEE', 'INVITE_ACCEPT', invite.id);

    return responseWithSuccess(response, invite);
  }

  async delete({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    const userUId = request.param('id');
    const user = auth.user;
    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const isDeleted = await EmployeeService.delete(user, userUId);
    await LogService.create(auth.user as any, 'EMPLOYEE', 'DELETE_EMPLOYEE', user.id);

    return responseWithSuccess(response, isDeleted);
  }

  async cancelInvite({ params, response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await EmployeeService.cancelInvite(params.id, user);
    await LogService.create(auth.user as any, 'EMPLOYEE', 'INVITE_CANCEL', params.id);

    return responseWithSuccess(response);
  }
}
