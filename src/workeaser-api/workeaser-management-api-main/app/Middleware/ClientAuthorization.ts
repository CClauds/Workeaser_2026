import { ClientType, UserRoleEnum } from 'Contracts/enums';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError } from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import ClientAuthorizationService from 'App/Services/Client/ClientAuthorizationService';

export default class ClientAuthorization {
  public async handle(
    { response, auth }: HttpContextContract,
    next: () => Promise<void>,
    modules?: string[]
  ) {
    try {
      const user = auth.user;
      await user?.load('clientAccount');

      if (!user || !user.clientAccount || user.role !== UserRoleEnum.CLIENT) {
        throw new AppError(AppError.UNAUTHORIZED, 'Unauthorized');
      }

      const clientType = await ClientAuthorizationService.getClientAccountType(
        user.clientAccount.id
      );

      switch (clientType) {
        case ClientType.MEMBER:
          const hasPermission = await ClientAuthorizationService.userHasPermissionToAccessModule(
            user.id,
            modules
          );

          if (!hasPermission) {
            throw new AppError(AppError.UNAUTHORIZED, 'Unauthorized');
          }

          break;
        case ClientType.MANAGER:
        case ClientType.INDIVIDUAL:
          // Authorize
          break;
        default:
          throw new AppError(AppError.UNAUTHORIZED, 'Unauthorized');
      }

      await next();
    } catch (error) {
      return responseWithError(response, error);
    }
  }
}
