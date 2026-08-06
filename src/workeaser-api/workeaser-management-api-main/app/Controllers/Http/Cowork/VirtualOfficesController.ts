import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Logger from '@ioc:Adonis/Core/Logger';
import VirtualOfficeService from 'App/Services/Cowork/VirtualOfficeService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { CheckFile, Sleep } from 'App/Utils/Generics';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import ChangeSearchAvailabilityValidator from 'App/Validators/Cowork/VirtualOffice/ChangeSearchAvailabilityValidator';
import VirtualOfficeValidator from 'App/Validators/Cowork/VirtualOffice/VirtualOfficeValidator';

export default class VirtualOfficesController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      if (!auth.user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const page = request.input('page', 1);
      const filters = request.all();
      const result = await VirtualOfficeService.list(auth.user, page, filters);

      return responseWithPagination(response, result);
    } catch (e) {
      await Logger.error('Error fetching virtual office', e);

      return responseWithError(response, e.message);
    }
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const resource = await VirtualOfficeService.show(params.id, user);

      return responseWithSuccess(response, resource);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    if (!auth.user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payload = await request.validate(VirtualOfficeValidator);
    const resource = await VirtualOfficeService.store(payload, auth.user);

    await LogService.create(auth.user as any, 'VIRTUAL_OFFICE', 'CREATE', resource.id);
    await Logger.info('Virtual office created', resource.id);

    return responseWithSuccess(response, resource);
  }

  async update({ params, auth, request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      if (!auth.user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const payload = await request.validate(VirtualOfficeValidator);
      const resource = await VirtualOfficeService.update(params.id, auth.user, payload);

      await LogService.create(auth.user as any, 'VIRTUAL_OFFICE', 'UPDATE', resource.id);

      return responseWithSuccess(response, resource);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  async destroy({ params, auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      if (!auth.user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await VirtualOfficeService.destroy(params.id, auth.user);
      await LogService.create(auth.user as any, 'VIRTUAL_OFFICE', 'DELETE', params.id);

      return responseWithSuccess(response);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  async changeSearchAvailability({ params, auth, response, request }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      if (!auth.user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const payload = await request.validate(ChangeSearchAvailabilityValidator);
      await VirtualOfficeService.changeSearchAvailability(params.id, auth.user, payload.searchable);
      await LogService.create(auth.user as any, 'VIRTUAL_OFFICE', 'CHANGE_AVAILABILITY', params.id);

      return responseWithSuccess(response);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  async import({ response, auth, request }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const file = request.file('file', {
        extnames: ['csv', 'xls', 'xlsx']
      });

      const res = await VirtualOfficeService.import(file, user);

      return responseWithSuccess(response, res);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  async export({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const res = await VirtualOfficeService.export(user);

      if (res === 'success') {
        await Sleep(16000);
        await CheckFile(response, './VirtualOffice.xlsx');
      } else {
        return responseWithError(response, res);
      }
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }
}
