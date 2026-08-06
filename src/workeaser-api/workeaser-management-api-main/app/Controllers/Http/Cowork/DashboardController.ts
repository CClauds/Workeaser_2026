import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import DashboardService from 'App/Services/Cowork/DashboardService';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class DashboardController {
  async mainDashboard({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await DashboardService.mainDashboard(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async locationsDashboard({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const results = await DashboardService.locationsDashboard(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async servicesDashboard({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const results = await DashboardService.servicesDashboard(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async relationshipDashboard({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');

      if (!user.coworkUser) {
        throw new AppError(AppError.INVALID_COWORK, 'No cowork account associated with this user');
      }

      const results = await DashboardService.relationshipDashboard(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async financesDashboard({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const results = await DashboardService.financesDashboard(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
