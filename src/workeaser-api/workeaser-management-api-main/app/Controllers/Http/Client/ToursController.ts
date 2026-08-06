import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import TourService from 'App/Services/Client/TourService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { responseWithSuccess } from 'App/Utils/ResponseApi';
import StoreTourRequestValidator from 'App/Validators/Client/Spaces/Tours/StoreTourRequestValidator';

export default class ToursController {
  async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreTourRequestValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newTour = await TourService.store(user, payload);
    await LogService.create(auth.user as any, 'TOUR', 'CLIENT_REQUEST', newTour.id);
    return responseWithSuccess(response, newTour);
  }
}
