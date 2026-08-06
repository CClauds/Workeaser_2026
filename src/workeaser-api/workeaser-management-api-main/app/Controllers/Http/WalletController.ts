import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import { WalletTypesEnum } from 'Contracts/enums';
import AppError from 'App/Utils/AppError';
import LogService from 'App/Services/LogService';
import WalletService from 'App/Services/WalletService';
import StoreWalletValidator from 'App/Validators/StoreWalletValidator';
import UpdateWalletValidator from 'App/Validators/UpdateWalletValidator';

export default class WalletController {
  async index({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const wallet = await WalletService.list(user);
      return responseWithSuccess(response, wallet);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const method = this.getParamsPaymentMethod(params.payment_type);

      const result = await WalletService.show(user, method, params.id);
      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(StoreWalletValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const method = this.getParamsPaymentMethod(params.payment_type);

      const newMethod = await WalletService.store(
        user,
        method,
        payload.token,
        payload.nickname,
        payload.account_id
      );

      await LogService.create(auth.user as any, payload.payment_method, 'CREATE', newMethod.id);

      return responseWithSuccess(response, newMethod);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async update({ request, response, params, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(UpdateWalletValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const method = this.getParamsPaymentMethod(params.payment_type);
      const updateMethod = await WalletService.update(user, method, params.id, payload);

      await LogService.create(auth.user as any, method, 'UPDATE', params.id);

      return responseWithSuccess(response, updateMethod);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async delete({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const method = this.getParamsPaymentMethod(params.payment_type);
      await WalletService.delete(user, method, params.id);

      await LogService.create(auth.user as any, method, 'DELETE', params.id);

      return responseWithSuccess(response, { message: 'Ok' });
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async generateTokenLink({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      const result = await WalletService.generateTokenLink(user);
      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  private getParamsPaymentMethod(param) {
    let method: WalletTypesEnum;

    switch (String(param).toLowerCase()) {
      case 'bank_account':
        method = WalletTypesEnum.BANK_ACCOUNT;
        break;
      case 'card':
        method = WalletTypesEnum.CARD;
        break;
      default:
        throw new AppError(AppError.BAD_REQUEST, 'Bad request');
    }

    return method;
  }
}
