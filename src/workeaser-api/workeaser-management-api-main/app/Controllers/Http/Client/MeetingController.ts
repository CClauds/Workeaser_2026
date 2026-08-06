import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import MeetingService from 'App/Services/Client/MeetingService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';
import StoreMeetingRequestValidator from 'App/Validators/Client/Meeting/StoreMeetingRequestValidator';

export default class MeetingController {
  async list({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MeetingService.list(user, page);

    return responseWithPagination(response, resource);
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MeetingService.show(user, id);

    return responseWithSuccess(response, resource);
  }

  async request({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreMeetingRequestValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newMeeting = await MeetingService.bookMeeting(payload, user);
    await LogService.create(auth.user as any, 'MEETING', 'CLIENT_REQUEST', newMeeting.id);

    return responseWithSuccess(response, newMeeting);
  }

  async cancel({ response, auth, params }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const id = params.id;
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const cancelMeeting = await MeetingService.cancelMeeting(id, user);
    await LogService.create(auth.user as any, 'MEETING', 'CLIENT_CANCEL_MEETING', cancelMeeting.id);

    return responseWithSuccess(response, cancelMeeting);
  }
}
