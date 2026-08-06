import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import BoldSignService from 'App/Services/Cowork/BoldSignService';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { CoworkUserRoleEnum } from 'Contracts/enums';

export default class BoldSignsController {
  async GetIdentity({ response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user?.email || user.coworkUser.role !== CoworkUserRoleEnum.MANAGER) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const identity = await BoldSignService.GetIdentityDetailByUser(user);
    if (!identity) {
      await BoldSignService.CreateIdentity(user);
      const identity = await BoldSignService.GetIdentityDetailByUser(user);
      return responseWithSuccess(response, identity);
    }
    return responseWithSuccess(response, identity);
  }

  async CreateIdentity({ response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user?.email || user?.fullName || user.coworkUser.role !== CoworkUserRoleEnum.MANAGER) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const service = await BoldSignService.CreateIdentity(user);
    return responseWithSuccess(response, service);
  }

  async ResendIdentity({ response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user?.email || user.coworkUser.role !== CoworkUserRoleEnum.MANAGER) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const service = await BoldSignService.ResendIdentityRequest(user);
    return responseWithSuccess(response, service);
  }

  async ResendRevokedIdentity({ response, auth }: HttpContextContract) {
    try {
      const user = auth.user;

      if (!user?.email || user.coworkUser.role !== CoworkUserRoleEnum.MANAGER) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const service = await BoldSignService.ResendRevokedIdentity(user);
      return responseWithSuccess(response, service);
    } catch (err) {
      return responseWithError(response, err.message);
    }
  }
}
