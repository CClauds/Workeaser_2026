import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import TaxesService from 'App/Services/Cowork/TaxesService';
import StoreTaxValidator from 'App/Validators/Cowork/Taxes/StoreTaxValidator';
import LogService from 'App/Services/LogService';

export default class TaxesController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const paginate = request.input('paginate', true);
      const page = request.input('page', 1);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await TaxesService.list(user, paginate, page);

      return responseWithPagination(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const tax = await TaxesService.show(id, user);

      return responseWithSuccess(response, tax);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(StoreTaxValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const newTax = await TaxesService.store(user, payload);
      await LogService.create(auth.user as any, 'TAX', 'CREATE', newTax.id);

      return responseWithSuccess(response, newTax);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(StoreTaxValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const updatedTax = await TaxesService.update(params.id, user, payload);

      await LogService.create(auth.user as any, 'TAX', 'UPDATE', updatedTax.id);

      return responseWithSuccess(response, updatedTax);
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

      await TaxesService.delete(params.id, user);
      await LogService.create(auth.user as any, 'TAX', 'DELETE', params.id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
