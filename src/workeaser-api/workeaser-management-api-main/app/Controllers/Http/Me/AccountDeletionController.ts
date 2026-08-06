/**
 * AccountDeletionController — LGPD direitos do titular.
 * Sprint B (HF-SPRINT-B-03).
 *
 * Endpoints:
 *  POST   /api/me/delete-account             cria pedido de exclusão (janela 7d)
 *  GET    /api/me/delete-account             lista pedidos do user
 *  DELETE /api/me/delete-account/:id         cancela pedido (user only, em janela)
 *  GET    /api/me/export-data                portabilidade — devolve JSON com todos meus dados
 */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import DataDeletionService from 'App/Services/DataDeletionService';

export default class AccountDeletionController {
  public async createRequest({ auth, request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const reason: string | undefined = request.input('reason');
      if (reason && typeof reason !== 'string') {
        throw new AppError(AppError.VALIDATION_FAIL, 'reason deve ser string');
      }
      if (reason && reason.length > 1000) {
        throw new AppError(AppError.VALIDATION_FAIL, 'reason muito longa (max 1000 chars)');
      }

      const req = await DataDeletionService.createRequest(user.id, reason);

      return response.status(201).json({
        status: 'OK',
        result: {
          id: req.id,
          status: req.status,
          requested_at: req.requestedAt.toISO(),
          scheduled_execution_at: req.scheduledExecutionAt?.toISO(),
          days_until_execution: req.daysUntilExecution(),
          message: `Sua conta será anonimizada em ${req.daysUntilExecution()} dias. Você pode cancelar a qualquer momento antes disso usando DELETE /api/me/delete-account/${req.id}.`,
        },
        error: null,
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async listRequests({ auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const requests = await DataDeletionService.listForUser(user.id);
      return responseWithSuccess(
        response,
        requests.map((r) => ({
          id: r.id,
          status: r.status,
          requested_at: r.requestedAt.toISO(),
          scheduled_execution_at: r.scheduledExecutionAt?.toISO(),
          completed_at: r.completedAt?.toISO(),
          rejection_reason: r.rejectionReason,
          days_until_execution: r.daysUntilExecution(),
        }))
      );
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async cancelRequest({ auth, params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');

      const req = await DataDeletionService.cancelByUser(id, user.id);
      return responseWithSuccess(response, {
        id: req.id,
        status: req.status,
        message: 'Pedido de exclusão cancelado. Sua conta permanece ativa.',
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Right-to-portability: download dos meus dados em JSON. */
  public async exportData({ auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.header('Content-Disposition', `attachment; filename="workeaser-export-user-${auth.user?.id}-${Date.now()}.json"`);
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const data = await DataDeletionService.exportUserData(user.id);
      return response.json(data);
    } catch (err) {
      return responseWithError(response, err);
    }
  }
}
