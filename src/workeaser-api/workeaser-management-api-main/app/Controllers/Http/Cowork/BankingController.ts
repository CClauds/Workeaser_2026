import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import LinkBankingAccountService from 'App/Services/Cowork/LinkBankingAccountService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import AddNoteValidator from 'App/Validators/Cowork/Banking/AddNoteValidator';
import ChangeCategoryValidator from 'App/Validators/Cowork/Banking/ChangeCategoryValidator';

export default class BankingController {
  async list({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const id = params.id;
      const filters = request.all();
      const page = request.input('page', 1);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await LinkBankingAccountService.listTransactions(user, id, filters, page);

      return responseWithPagination(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async showTransaction({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const id = params.id;
      const transactionId = params.transactionId;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LinkBankingAccountService.showTransaction(user, id, transactionId);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async addNote({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(AddNoteValidator);

      const user = auth.user;
      const id = params.id;
      const transactionId = params.transactionId;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LinkBankingAccountService.addNote(user, payload, id, transactionId);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async changeCategory({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(ChangeCategoryValidator);

      const user = auth.user;
      const id = params.id;
      const transactionId = params.transactionId;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LinkBankingAccountService.changeCategory(
        user,
        payload,
        id,
        transactionId
      );

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async recordTransaction({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const id = params.id;
      const transactionId = params.transactionId;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LinkBankingAccountService.recordTransaction(user, id, transactionId);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async voidTransaction({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const id = params.id;
      const transactionId = params.transactionId;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LinkBankingAccountService.voidTransaction(user, id, transactionId);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async syncTransactions({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const id = params.id;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await LinkBankingAccountService.syncTransactions(user, id);
      await LogService.create(auth.user as any, 'BANKING', 'SYNC', id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
