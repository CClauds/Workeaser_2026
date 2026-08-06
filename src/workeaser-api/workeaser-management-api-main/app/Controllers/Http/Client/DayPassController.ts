import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithSuccess } from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import LogService from 'App/Services/LogService';
import DayPassService from 'App/Services/Client/DayPassService';
import StoreDayPassRequestValidator from 'App/Validators/Client/DayPass/StoreDayPassRequestValidator';
import StoreDayPassVisitRequestValidator from 'App/Validators/Client/Spaces/DayPass/StoreDayPassVisitRequestValidator';

export default class DayPassController {
  async request({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreDayPassRequestValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newDayPass = await DayPassService.clientRequestDayPass(user, payload);
    await LogService.create(auth.user as any, 'DAY_PASS', 'CLIENT_REQUEST', newDayPass.id);

    return responseWithSuccess(response, newDayPass);
  }

  async requestVisit({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const payload = await request.validate(StoreDayPassVisitRequestValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const newDayPass = await DayPassService.lead(user, payload);
    await LogService.create(auth.user as any, 'DAY_PASS', 'LEAD_VISIT_REQUEST', newDayPass.id);

    return responseWithSuccess(response, newDayPass);
  }
}
