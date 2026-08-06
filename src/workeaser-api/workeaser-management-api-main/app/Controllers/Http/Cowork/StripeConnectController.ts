import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import StripeConnectService from 'App/Services/Cowork/StripeConnectService';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import StoreExternalAccountValidator from 'App/Validators/Cowork/Settings/StoreExternalAccountValidator';

export default class StripeConnectController {
  async getOnboardingUrl({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const url = await StripeConnectService.getOnboardingUrl(user);

      return responseWithSuccess(response, { url });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async listExternalAccount({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const externalAccounts = await StripeConnectService.listExternalAccount(
        user.coworkUser.coworkAccountId
      );

      return responseWithSuccess(response, externalAccounts);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async showExternalAccount({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const resource = await StripeConnectService.showExternalAccount(
        user.coworkUser.coworkAccountId,
        params.id
      );

      return responseWithSuccess(response, resource);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async createExternalAccount({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const payload = await request.validate(StoreExternalAccountValidator);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const externalAccount = await StripeConnectService.createExternalAccount(
        user.coworkUser.coworkAccountId,
        payload.token,
        payload.default_for_currency
      );

      return responseWithSuccess(response, externalAccount);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async changeDefaultExternalAccount({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      await StripeConnectService.changeDefaultExternalAccount(
        user.coworkUser.coworkAccountId,
        params.id
      );

      return responseWithSuccess(response, { changed: true });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async deleteExternalAccount({ params, response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await user.load('coworkUser');
    await StripeConnectService.deleteExternalAccount(user.coworkUser.coworkAccountId, params.id);

    return responseWithSuccess(response, { deleted: true });
  }
}
