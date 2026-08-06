import AppError from 'App/Utils/AppError';
import { UserRoleEnum } from 'Contracts/enums';
import { responseWithError } from 'App/Utils/ResponseApi';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class AdminAuthorization {
  public async handle({ response, auth }: HttpContextContract, next: () => Promise<void>) {
    try {
      const user = auth.user;

      if (!user || user.role !== UserRoleEnum.ADMIN) {
        throw new AppError(AppError.UNAUTHORIZED, 'Unauthorized');
      }

      await next();
    } catch (error) {
      return responseWithError(response, error);
    }
  }
}
