import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import MailboxService from 'App/Services/Client/MailboxService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import { responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';
import UpdateMailboxClientValidator from 'App/Validators/Client/Mailbox/UpdateMailboxClientValidator';

export default class MailboxesController {
  public async index({ request, response, auth }: HttpContextContract) {
    const user = auth.user;
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await MailboxService.index(user, page);

    return responseWithPagination(response, results);
  }

  public async show({ params, response, auth }: HttpContextContract) {
    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MailboxService.show(user, id);

    return responseWithSuccess(response, resource);
  }

  public async update({ request, response, params, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    await request.validate(UpdateMailboxClientValidator);
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const result = await MailboxService.update(params.id, user, request.all());
    await LogService.create(auth.user as any, 'MAILBOXES_CLIENT', 'UPDATE', params.id);

    return responseWithSuccess(response, result);
  }
}
