import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import LogService from 'App/Services/LogService';
import StoreSettingValidator from 'App/Validators/Cowork/Settings/StoreSettingValidator';
import CoworkSettingsService from 'App/Services/Cowork/SettingsService';
import LinkBankingAccountService from 'App/Services/Cowork/LinkBankingAccountService';
import StoreBankAccountValidator from 'App/Validators/Cowork/Settings/StoreBankAccountValidator';

export default class SettingsController {
  async index({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const results = await CoworkSettingsService.getSettings(user.coworkUser.coworkAccountId);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async update({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(StoreSettingValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const updatedSettings = await CoworkSettingsService.update(
        user.coworkUser.coworkAccountId,
        payload
      );
      await LogService.create(auth.user as any, 'SETTING', 'UPDATE', updatedSettings.id);

      return responseWithSuccess(response, updatedSettings);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async bankingList({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await user.load('coworkUser');
      const results = await LinkBankingAccountService.bankingAccounts(
        user.coworkUser.coworkAccountId
      );

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async generateLinkToken({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LinkBankingAccountService.generateTokenLink(user);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async storeBanking({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const payload = await request.validate(StoreBankAccountValidator);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await LinkBankingAccountService.storeBanking(user, payload);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async deleteBanking({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const id = params.id;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await LinkBankingAccountService.deleteBankingAccount(user, id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async subscriptions({ response, auth }: HttpContextContract) {
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

      const results = await CoworkSettingsService.subscriptions(user.coworkUser.coworkAccountId);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error);
    }
  }
}
