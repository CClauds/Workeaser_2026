import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import LocationService from 'App/Services/Cowork/LocationService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';

import { CheckFile, Sleep } from 'App/Utils/Generics';
import StoreLocationValidator from 'App/Validators/StoreLocationValidator';
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

      const results = await LocationService.list(user, filters, page);

      return responseWithPagination(response, results);
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

      const location = await LocationService.show(params.id, user);

      return responseWithSuccess(response, location);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreLocationValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newLocation = await LocationService.store(user, payload);
    await LogService.create(auth.user as any, 'LOCATIONS', 'CREATE', newLocation.id);

    return responseWithSuccess(response, newLocation);
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(StoreLocationValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const updatedLocation = await LocationService.update(params.id, user, payload);
      await LogService.create(auth.user as any, 'LOCATIONS', 'UPDATE', params.id);

      return responseWithSuccess(response, updatedLocation);
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

      await LocationService.delete(params.id, user);
      await LogService.create(auth.user as any, 'LOCATIONS', 'DELETE', params.id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
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

      const res = await LocationService.import(file, user);

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
      const res = await LocationService.export(user);

      if (res === 'success') {
        await Sleep(16000);
        await CheckFile(response, `./Location.xlsx`);
      } else {
        return responseWithError(response, res);
      }
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  // async getServices({ params, response, auth }: HttpContextContract) {
  //   try {
  //     const user = auth.user;

  //     if (!user) {
  //       throw new AppError(AppError.FORBIDDEN, 'Forbidden');
  //     }

  //     const location = await LocationService.showServices(params.id, user);

  //     return responseWithSuccess(response, location);
  //   } catch (error) {
  //     return responseWithError(response, error);
  //   }
  // }
}
