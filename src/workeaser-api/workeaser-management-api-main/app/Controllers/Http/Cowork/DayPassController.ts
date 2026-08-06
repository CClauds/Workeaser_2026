import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import DayPassService from 'App/Services/Cowork/DayPassService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import StoreDayPassValidator from 'App/Validators/Cowork/DayPass/StoreDayPassValidator';

export default class DayPassController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const filters = request.all();
      const paginate = request.input('paginate', true);
      const page = request.input('page', 1);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await DayPassService.list(user, filters, paginate, page);

      return responseWithPagination(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const dayPass = await DayPassService.show(params.id, user);

      return responseWithSuccess(response, dayPass);
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    const payload = await request.validate(StoreDayPassValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newDayPass = await DayPassService.store(user, payload);
    await LogService.create(auth.user as any, 'DAY_PASS', 'CREATE', newDayPass.id);

    return responseWithSuccess(response, newDayPass);
  }

  async delete({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await DayPassService.delete(params.id, user);
      await LogService.create(auth.user as any, 'DAY_PASS', 'COWORK_DELETE', params.id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async approve({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const updatedDayPass = await DayPassService.approve(params.id, user);
    await LogService.create(auth.user as any, 'DAY_PASS', 'APPROVE', updatedDayPass.id);

    return responseWithSuccess(response, updatedDayPass);
  }

  async reject({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const updatedDayPass = await DayPassService.reject(params.id, user);
    await LogService.create(auth.user as any, 'DAY_PASS', 'REJECT', updatedDayPass.id);

    return responseWithSuccess(response, updatedDayPass);
  }
}
