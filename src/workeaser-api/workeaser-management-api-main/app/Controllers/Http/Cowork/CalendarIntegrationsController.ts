import AppError from 'App/Utils/AppError';
import CalendarIntegrationService from 'App/Services/Cowork/CalendarIntegrationService';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class CalendarIntegrationsController {
  public async list({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');

      const integrations = await CalendarIntegrationService.list(user.coworkUser.coworkAccountId);

      return responseWithSuccess(response, integrations);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async delete({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const id = params.id;

      await user.load('coworkUser');
      await CalendarIntegrationService.delete(user.coworkUser.coworkAccountId, id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
