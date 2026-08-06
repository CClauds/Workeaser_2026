import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import CoworkStatusService from 'App/Services/Cowork/CoworkStatusService';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import StripeStatusValidator from 'App/Validators/Cowork/Stripe/StripeStatusValidator';

export default class CoworkStatusController {
  async index({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const results = await CoworkStatusService.index(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async update({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(StripeStatusValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const updatedStripeStatus = await CoworkStatusService.update(user, payload);

      return responseWithSuccess(response, updatedStripeStatus);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
