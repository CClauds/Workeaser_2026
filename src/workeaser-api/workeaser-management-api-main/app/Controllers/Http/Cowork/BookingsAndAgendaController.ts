import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import AppError from 'App/Utils/AppError';
import BookingsAndAgendaService from 'App/Services/Cowork/BookingsAndAgendaService';

export default class BookingsAndAgendaController {
  async unapproved({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await BookingsAndAgendaService.unapproved(user);

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }

  async scheduled({ response, auth, request }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const results = await BookingsAndAgendaService.scheduled(
        user,
        request.input('month'),
        request.input('year')
      );

      return responseWithSuccess(response, results);
    } catch (error) {
      return responseWithError(response, error.message);
    }
  }
}
