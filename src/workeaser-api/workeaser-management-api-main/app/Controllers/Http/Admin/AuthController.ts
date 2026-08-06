import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

import UserService from 'App/Services/UserService';
import LoginUserValidator from 'App/Validators/Auth/LoginUserValidator';

export default class AuthController {
  public async login({ request, auth, response }: HttpContextContract) {
    const payload = await request.validate(LoginUserValidator);
    const userToken = await UserService.admin(auth, payload);

    return responseWithSuccess(response, userToken);
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      await UserService.logout(auth);

      return responseWithSuccess(response, { revoked: true });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
