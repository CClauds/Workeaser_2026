import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import CoworkAuthorizationService from 'App/Services/Cowork/CoworkAuthorizationService';
import AppError from 'App/Utils/AppError';
import { CoworkUserRoleEnum, UserRoleEnum } from 'Contracts/enums';

export default class CoworkAuthorization {
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    modules?: string[]
  ) {
    const user = auth.user;
    await user?.load('coworkUser');

    if (!user || !user.coworkUser || user.role !== UserRoleEnum.COWORKING) {
      throw new AppError(AppError.UNAUTHORIZED, 'Unauthorized');
    }

    switch (user.coworkUser.role) {
      case CoworkUserRoleEnum.EMPLOYEE:
        const hasPermission = await CoworkAuthorizationService.userHasPermissionToAccessModule(
          user.id,
          modules
        );

        if (!hasPermission) {
          throw new AppError(AppError.FORBIDDEN, 'Forbidden');
        }

        break;
      case CoworkUserRoleEnum.MANAGER:
        // Authorize
        break;
      default:
        throw new AppError(AppError.UNAUTHORIZED, 'Unauthorized');
    }

    await next();
  }
}
