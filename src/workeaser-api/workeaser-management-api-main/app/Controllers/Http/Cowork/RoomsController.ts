import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import RoomService from 'App/Services/Cowork/RoomService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { CheckFile, Sleep } from 'App/Utils/Generics';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import ChangeSearchAvailabilityValidator from 'App/Validators/Cowork/Locations/ChangeSearchAvailabilityValidator';
import StoreRoomValidator from 'App/Validators/Cowork/Locations/StoreRoomValidator';

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

      const results = await RoomService.list(user, filters, page);

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

      const room = await RoomService.show(id, user);

      return responseWithSuccess(response, room);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(StoreRoomValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newRoom = await RoomService.store(user, payload);
    await LogService.create(auth.user as any, 'ROOM', 'CREATE', newRoom.id);

    return responseWithSuccess(response, newRoom);
  }

  async update({ params, request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const payload = await request.validate(StoreRoomValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const updatedRoom = await RoomService.update(params.id, user, payload);
      await LogService.create(auth.user as any, 'ROOM', 'UPDATE', updatedRoom.id);

      return responseWithSuccess(response, updatedRoom);
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

      await RoomService.delete(params.id, user);
      await LogService.create(auth.user as any, 'ROOM', 'DELETE', params.id);

      return responseWithSuccess(response);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async changeSearchAvailability({ params, auth, response, request }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      if (!auth.user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const payload = await request.validate(ChangeSearchAvailabilityValidator);
      await RoomService.changeSearchAvailability(params.id, auth.user, payload.searchable);
      await LogService.create(auth.user as any, 'ROOM', 'CHANGE_AVAILABILITY', params.id);

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

      const res = await RoomService.import(file, user);

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

      const res = await RoomService.export(user);

      if (res === 'success') {
        await Sleep(16000);
        await CheckFile(response, './privateRoom.xlsx');
      } else {
        return responseWithError(response, res);
      }
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }
}
