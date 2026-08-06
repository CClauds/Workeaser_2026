import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import LeadService from 'App/Services/Cowork/LeadService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import StoreLeadValidator from 'App/Validators/Cowork/Lead/StoreLeadValidator';
import UpdateLeadValidator from 'App/Validators/Cowork/Lead/UpdateLeadValidator';

export default class PersonasManagementsController {
  async index({ request, response, auth }: HttpContextContract) {
    const user = auth.user;
    const filters = request.all();
    const paginate = request.input('paginate', true);
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await LeadService.list(user, filters, paginate, page);

    return responseWithPagination(response, results);
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const lead = await LeadService.show(id, user);

      return responseWithSuccess(response, lead);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreLeadValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const lead = await LeadService.store(payload, user);

    return responseWithSuccess(response, lead);
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(UpdateLeadValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const updatedLead = await LeadService.update(params.id, user, payload);
      await LogService.create(auth.user as any, 'LEAD', 'COWORK_UPDATE', updatedLead.id);

      return responseWithSuccess(response, updatedLead);
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

      await LeadService.delete(params.id, user);
      await LogService.create(auth.user as any, 'LEAD', 'DELETE', params.id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
