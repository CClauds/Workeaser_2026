import AppError from 'App/Utils/AppError';
import LogService from 'App/Services/LogService';
import SpaceService from 'App/Services/Client/SpaceService';
import ReserveNowValidator from 'App/Validators/Client/Spaces/ReserveNowValidator';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithSuccess } from 'App/Utils/ResponseApi';

export default class SpacesController {
  public async reserveNow({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const payload = await request.validate(ReserveNowValidator);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await SpaceService.reserveNow(user, payload);
    await LogService.create(auth.user as any, 'SPACES', 'RESERVE_NOW', resource.id);

    return responseWithSuccess(response, resource);
  }
}
