import AppError from 'App/Utils/AppError';
import NotificationServices from 'App/Services/NotificationsService';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
  responseWithError,
  responseWithPagination,
  responseWithSuccess
} from 'App/Utils/ResponseApi';

export default class NotificationsController {
  public async show({ request, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const page = request.input('page', 1);

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const res = await NotificationServices.show(user, page);

      return responseWithPagination(response, res);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  public async count({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      const res = await NotificationServices.count(user);

      return responseWithSuccess(response, res);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  public async delete({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      const notificationId = params.id;

      if (!user) {
        throw new AppError(AppError.FORBIDDEN, 'Forbidden');
      }

      await NotificationServices.delete(user, notificationId);

      return responseWithSuccess(response);
    } catch (e) {
      return responseWithError(response, e.message);
    }
  }

  /**
   * HF-SPRINT-H-05: marcar notificação como lida.
   * POST /api/notifications/:id/read
   */
  public async markAsRead({ params, response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.FORBIDDEN, 'Forbidden');

      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');

      // Lazy import + update direto via Database pra evitar acoplamento com model interno
      const Database = (await import('@ioc:Adonis/Lucid/Database' as any)).default;
      const affected = await Database.from('notifications')
        .where('id', id)
        .where('client_id', user.id)
        .whereNull('read_at')
        .update({ read_at: new Date() });

      return responseWithSuccess(response, { updated: affected });
    } catch (e: any) {
      return responseWithError(response, e?.message || 'Erro ao marcar como lida');
    }
  }

  /**
   * HF-SPRINT-H-05: marcar todas as não-lidas como lidas.
   * POST /api/notifications/read-all
   */
  public async markAllAsRead({ response, auth }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.FORBIDDEN, 'Forbidden');

      const Database = (await import('@ioc:Adonis/Lucid/Database' as any)).default;
      const affected = await Database.from('notifications')
        .where('client_id', user.id)
        .whereNull('read_at')
        .update({ read_at: new Date() });

      return responseWithSuccess(response, { updated: affected });
    } catch (e: any) {
      return responseWithError(response, e?.message || 'Erro ao marcar todas como lidas');
    }
  }
}
