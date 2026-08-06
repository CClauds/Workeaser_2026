import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import InvoiceService from 'App/Services/Client/InvoiceService';

export default class InvoicesController {
  async index({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const filters = request.all();
    const paginate = request.input('paginate', true);
    const page = request.input('page', 1);

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const results = await InvoiceService.list(user, filters, paginate, page);

    return responseWithPagination(response, results);
  }

  async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const id = params.id;
    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const room = await InvoiceService.show(id, user);

    return responseWithSuccess(response, room);
  }
}
