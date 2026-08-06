import AppError from 'App/Utils/AppError';
import MyMembershipService from 'App/Services/Client/MyMembershipService';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithSuccess } from 'App/Utils/ResponseApi';

export default class MyMembershipController {
  public async list({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MyMembershipService.list(user);

    return responseWithSuccess(response, resource);
  }

  public async show({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MyMembershipService.show(user, id);

    return responseWithSuccess(response, resource);
  }

  public async services({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MyMembershipService.productsAndServices(user, id);

    return responseWithSuccess(response, resource);
  }

  public async bookings({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MyMembershipService.bookings(user, id);

    return responseWithSuccess(response, resource);
  }

  public async mailbox({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MyMembershipService.mailbox(user, id);

    return responseWithSuccess(response, resource);
  }

  public async invoices({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');

    const user = auth.user;
    const id = params.id;

    if (!user) {
      throw new AppError(AppError.FORBIDDEN, 'Forbidden');
    }

    const resource = await MyMembershipService.invoices(user, id);

    return responseWithSuccess(response, resource);
  }
}
