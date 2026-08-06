import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import LogService from 'App/Services/LogService';
import LeadService from 'App/Services/Cowork/LeadService';
import StoreSalePipelineValidator from 'App/Validators/Cowork/Lead/StoreSalePipelineValidator';
import UpdateSalePipelineValidator from 'App/Validators/Cowork/Lead/UpdateSalePipelineValidator';
import UpdateSalePipelineStatusValidator from 'App/Validators/Cowork/Lead/UpdateSalePipelineStatusValidator';

export default class SalesPipelineController {
  async index({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await LeadService.salesPipeline(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const payload = await request.validate(StoreSalePipelineValidator);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LeadService.storeSalesPipeline(user, payload);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const payload = await request.validate(UpdateSalePipelineValidator);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LeadService.updateSalesPipeline(user, params.id, payload);
      await LogService.create(auth.user as any, 'SALES_PIPELINE', 'UPDATE', result.id);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async updateStatus({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const payload = await request.validate(UpdateSalePipelineStatusValidator);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await LeadService.updateSalesPipelineStatus(user, params.id, payload.status);
      await LogService.create(auth.user as any, 'SALES_PIPELINE', 'UPDATE_STATUS', result.id);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
