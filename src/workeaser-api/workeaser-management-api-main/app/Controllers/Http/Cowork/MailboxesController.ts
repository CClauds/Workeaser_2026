import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import MailboxService from 'App/Services/Cowork/MailboxService';
import LogService from 'App/Services/LogService';
import AppError from 'App/Utils/AppError';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';
import StoreMailboxValidator from 'App/Validators/Cowork/Mailbox/StoreMailboxValidator';
import UpdateMailboxValidator from 'App/Validators/Cowork/Mailbox/UpdateMailboxValidator';

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

  public async store({ request, response, auth }: HttpContextContract) {
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const payload = await request.validate(StoreMailboxValidator);
    const result = await MailboxService.store(user, payload);
    await LogService.create(auth.user as any, 'MAILBOXES', 'CREATE', result.id);

    return responseWithSuccess(response, result);
  }

  public async show({ response, params, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = params.id;
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await MailboxService.show(id, user);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  public async update({ request, response, params, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      await request.validate(UpdateMailboxValidator);
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const result = await MailboxService.update(params.id, user, request.all());
      await LogService.create(auth.user as any, 'MAILBOXES', 'UPDATE', params.id);

      return responseWithSuccess(response, result);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
