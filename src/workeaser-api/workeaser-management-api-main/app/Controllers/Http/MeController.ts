import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import UserService from 'App/Services/UserService';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import UpdateMeValidator from 'App/Validators/Auth/UpdateMeValidator';

export default class MeController {
  public async show({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const resource = await UserService.show(user);
      return responseWithSuccess(response, resource);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async update({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }
      const resource = await User.findByOrFail('id', user.id);
      // Lote 5b: usar o payload VALIDADO ao inves de request.all() para
      // bloquear injeção de campos sensíveis (role, email_confirmed, etc).
      const payload = await request.validate(UpdateMeValidator);
      await UserService.update(payload, resource);
      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
