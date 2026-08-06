import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import DeskService from 'App/Services/Cowork/DeskService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { CheckFile, Sleep } from 'App/Utils/Generics';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import ChangeSearchAvailabilityValidator from 'App/Validators/Cowork/Locations/ChangeSearchAvailabilityValidator';
import StoreDeskValidator from 'App/Validators/Cowork/Locations/StoreDeskValidator';

export default class LocationsController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const filters = request.all();
      const page = request.input('page', 1);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await DeskService.list(user, filters, page);

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

      const location = await DeskService.show(id, user);

      return responseWithSuccess(response, location);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreDeskValidator);
    const user = auth.user;
    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newDesk = await DeskService.store(user, payload);
    await LogService.create(auth.user as any, 'DESKS', 'CREATE', newDesk.id);

    return responseWithSuccess(response, newDesk);
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreDeskValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const updatedDesk = await DeskService.update(params.id, user, payload);

    await LogService.create(auth.user as any, 'DESKS', 'UPDATE', updatedDesk.id);

    return responseWithSuccess(response, updatedDesk);
  }

  async delete({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await DeskService.delete(params.id, user);
      await LogService.create(auth.user as any, 'DESKS', 'DELETE', params.id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async changeSearchAvailability({ params, auth, response, request }: HttpContextContract) {
    try {
      if (!auth.user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const payload = await request.validate(ChangeSearchAvailabilityValidator);
      await DeskService.changeSearchAvailability(params.id, auth.user, payload.searchable);
      await LogService.create(auth.user as any, 'DESKS', 'CHANGE_AVAILABILITY', params.id);

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

      const res = await DeskService.import(file, user);

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

      const res = await DeskService.export(user);

      if (res === 'success') {
        await Sleep(16000);
        await CheckFile(response, './Desks.xlsx');
      } else {
        return responseWithError(response, res);
      }
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }
}
