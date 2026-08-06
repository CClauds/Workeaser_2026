import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import DealsOpportunitiesService from 'App/Services/Cowork/DealsOpportunitiesService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class DealsOpportunitiesController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await DealsOpportunitiesService.list(user, page);

    return responseWithPagination(response, results);
  }

  async show({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await DealsOpportunitiesService.show(user, params.id);

    return responseWithSuccess(response, results);
  }

  async approve({ response, auth, params }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const result = await DealsOpportunitiesService.approve(user, params.id);
    await LogService.create(auth.user as any, 'SPACES', 'RESERVE_APPROVE', result.id);

    return responseWithSuccess(response, result);
  }

  async reject({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const result = await DealsOpportunitiesService.reject(user, params.id);
    await LogService.create(auth.user as any, 'SPACES', 'RESERVE_REJECT', result.id);

    return responseWithSuccess(response, result);
  }
}
