import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import MeetroomService from 'App/Services/Cowork/MeetroomService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { CheckFile, Sleep } from 'App/Utils/Generics';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import BookMeetingValidator from 'App/Validators/Cowork/Meetroom/BookMeetingValidator';
import ChangeSearchAvailabilityValidator from 'App/Validators/Cowork/Meetroom/ChangeSearchAvailabilityValidator';
import MeetroomValidator from 'App/Validators/Cowork/Meetroom/MeetroomValidator';

export default class MeetroomsController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    if (!auth.user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const page = request.input('page', 1);
    const filters = request.all();
    const result = await MeetroomService.list(auth.user, page, filters);

    return responseWithPagination(response, result);
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MeetroomService.show(params.id, user);

    return responseWithSuccess(response, resource);
  }

  async store({ request, response, auth }: HttpContextContract) {
    if (!auth.user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payload = await request.validate(MeetroomValidator);
    const resource = await MeetroomService.store(payload, auth.user);

    await LogService.create(auth.user as any, 'MEETROOM', 'CREATE', resource.id);

    return responseWithSuccess(response, resource);
  }

  async update({ params, auth, request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    if (!auth.user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payload = await request.validate(MeetroomValidator);
    const resource = await MeetroomService.update(params.id, auth.user, payload);

    await LogService.create(auth.user as any, 'MEETROOM', 'UPDATE', resource.id);

    return responseWithSuccess(response, resource);
  }

  async destroy({ params, auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    if (!auth.user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    await MeetroomService.destroy(params.id, auth.user);
    await LogService.create(auth.user as any, 'MEETROOM', 'DELETE', params.id);

    return responseWithSuccess(response);
  }

  async changeSearchAvailability({ params, auth, response, request }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    if (!auth.user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payload = await request.validate(ChangeSearchAvailabilityValidator);
    await MeetroomService.changeSearchAvailability(params.id, auth.user, payload.searchable);
    await LogService.create(auth.user as any, 'MEETROOM', 'CHANGE_AVAILABILITY', params.id);

    return responseWithSuccess(response);
  }

  async bookingMeeting({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    if (!auth.user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payload = await request.validate(BookMeetingValidator);
    const resource = await MeetroomService.bookMeeting(payload, auth.user);

    await LogService.create(auth.user as any, 'MEETROOM', 'BOOK_MEETING', resource.id);

    return responseWithSuccess(response, resource);
  }

  async bookingMeetingApprove({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const updatedMeeting = await MeetroomService.bookMeetingApprove(params.id, user);
    await LogService.create(auth.user as any, 'MEETING', 'APPROVE', updatedMeeting.id);

    return responseWithSuccess(response, updatedMeeting);
  }

  async bookingMeetingReject({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const updatedMeeting = await MeetroomService.bookMeetingReject(params.id, user);
    await LogService.create(auth.user as any, 'MEETING', 'REJECT', updatedMeeting.id);

    return responseWithSuccess(response, updatedMeeting);
  }

  async showMeeting({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await MeetroomService.showMeeting(id, user);

    return responseWithSuccess(response, results);
  }

  async import({ response, auth, request }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const file = request.file('file', {
      extnames: ['csv', 'xls', 'xlsx']
    });

    const res = await MeetroomService.import(file, user);

    return responseWithSuccess(response, res);
  }

  async export({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const res = await MeetroomService.export(user);

    if (res === 'success') {
      await Sleep(16000);
      await CheckFile(response, './Meetroom.xlsx');
    } else {
      return responseWithError(response, res);
    }
  }
}
