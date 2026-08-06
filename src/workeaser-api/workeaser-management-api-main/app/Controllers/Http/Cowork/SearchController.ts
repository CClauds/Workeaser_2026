import AppError from 'App/Utils/AppError';
import SearchService from 'App/Services/Cowork/SearchService';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class LocationsController {
  async searchUser({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const { q } = request.all();

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await SearchService.searchUser(user, q);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async getClientDetails({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const userId = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const details = await SearchService.getClientDetails(user, userId);

      return responseWithSuccess(response, details);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async getLeadDetails({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const userId = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const details = await SearchService.getLeadDetails(user, userId);

      return responseWithSuccess(response, details);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
