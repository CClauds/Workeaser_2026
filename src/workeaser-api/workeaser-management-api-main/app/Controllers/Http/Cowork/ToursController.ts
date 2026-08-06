import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import LogService from 'App/Services/LogService';
import TourService from 'App/Services/Cowork/TourService';
import StoreTourValidator from 'App/Validators/Cowork/Tour/StoreTourValidator';

export default class ToursController {
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

      const results = await TourService.list(user, filters, paginate, page);

      return responseWithPagination(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const dayPass = await TourService.show(id, user);

      return responseWithSuccess(response, dayPass);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreTourValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newTour = await TourService.store(user, payload);
    await LogService.create(auth.user as any, 'TOUR', 'COWORK_CREATE', newTour.id);

    return responseWithSuccess(response, newTour);
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreTourValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const updatedTour = await TourService.update(params.id, user, payload);
    await LogService.create(auth.user as any, 'TOUR', 'COWORK_UPDATE', updatedTour.id);

    return responseWithSuccess(response, updatedTour);
  }

  async delete({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await TourService.delete(params.id, user);
      await LogService.create(auth.user as any, 'TOUR', 'COWORK_DELETE', params.id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async approve({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const updatedTour = await TourService.approve(params.id, user);
      await LogService.create(auth.user as any, 'TOUR', 'APPROVE', updatedTour.id);

      return responseWithSuccess(response, updatedTour);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async reject({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const updatedTour = await TourService.reject(params.id, user);
      await LogService.create(auth.user as any, 'TOUR', 'REJECT', updatedTour.id);

      return responseWithSuccess(response, updatedTour);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
