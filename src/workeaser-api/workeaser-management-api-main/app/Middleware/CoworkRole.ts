import AppError from 'App/Utils/AppError';
import { UserRoleEnum } from 'Contracts/enums';
import { responseWithError } from 'App/Utils/ResponseApi';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

/**
 * 1B: Middleware que exige rol COWORKING o ADMIN.
 * Usado en rutas de dashboard/search que antes solo tenían 'auth'
 * y permitían acceso a CLIENT logueado (fuga de datos entre roles).
 */
export default class CoworkRole {
  public async handle({ response, auth }: HttpContextContract, next: () => Promise<void>) {
    try {
      const user = auth.user;

      if (!user || (user.role !== UserRoleEnum.COWORKING && user.role !== UserRoleEnum.ADMIN)) {
        throw new AppError(AppError.UNAUTHORIZED, 'Unauthorized');
      }

      await next();
    } catch (error) {
      return responseWithError(response, error);
    }
  }
}
