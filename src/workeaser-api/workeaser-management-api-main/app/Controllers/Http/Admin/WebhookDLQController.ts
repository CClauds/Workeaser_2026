/**
 * Admin WebhookDLQController — visualizar e gerenciar webhook_dead_letter_queue.
 * Sprint J (HF-SPRINT-J-04).
 *
 * Endpoints:
 *  GET    /api/admin/webhook-dlq                  → listar paginado + filtros
 *  GET    /api/admin/webhook-dlq/stats             → stats agregados últimos 7d
 *  GET    /api/admin/webhook-dlq/:id               → detalhe (com payload completo)
 *  POST   /api/admin/webhook-dlq/:id/retry         → força reprocessamento imediato
 *  POST   /api/admin/webhook-dlq/:id/discard       → marca como 'failed' manualmente (descarta)
 */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DateTime } from 'luxon';
import Database from '@ioc:Adonis/Lucid/Database';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';
import WebhookDeadLetterItem from 'App/Models/WebhookDeadLetterItem';
import WebhookRetryQueueService from 'App/Services/WebhookRetryQueueService';

export default class WebhookDLQController {
  public async index({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const page = Math.max(1, Number(request.input('page', 1)));
      const perPage = Math.min(100, Math.max(1, Number(request.input('per_page', 25))));
      const status = request.input('status');
      const provider = request.input('provider');

      const q = WebhookDeadLetterItem.query().orderBy('created_at', 'desc');
      if (status) q.where('status', String(status));
      if (provider) q.where('provider', String(provider));

      const result = await q.paginate(page, perPage);
      // Trunca payload na listagem pra response não ficar enorme
      const rows = result.all().map((r: any) => ({
        ...r.toJSON(),
        payload: typeof r.payload === 'string' && r.payload.length > 500
          ? r.payload.slice(0, 500) + '... (truncated)'
          : r.payload,
      }));
      return responseWithPagination(response, {
        toJSON: () => ({
          data: rows,
          meta: {
            current_page: result.currentPage,
            last_page: result.lastPage,
            total: result.total,
            per_page: result.perPage,
          },
        }),
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async show({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');
      const item = await WebhookDeadLetterItem.find(id);
      if (!item) throw new AppError(AppError.NOT_FOUND, 'DLQ item não encontrado');
      const json = item.toJSON();
      // Tenta parsear payload pra dev ler mais fácil
      try {
        (json as any).payload_parsed = JSON.parse(item.payload);
      } catch {
        (json as any).payload_parsed = null;
      }
      return responseWithSuccess(response, json);
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async stats({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'private, max-age=60');
    try {
      const days = Math.min(90, Math.max(1, Number(request.input('days', 7))));
      const since = new Date(Date.now() - days * 86400 * 1000);

      const byStatus = await Database.from('webhook_dead_letter_queue')
        .where('created_at', '>=', since)
        .groupBy('status')
        .select('status')
        .count('* as count');

      const byProvider = await Database.from('webhook_dead_letter_queue')
        .where('created_at', '>=', since)
        .groupBy('provider')
        .select('provider')
        .count('* as count');

      const total: any = await Database.from('webhook_dead_letter_queue')
        .where('created_at', '>=', since)
        .count('* as count')
        .first();

      return responseWithSuccess(response, {
        period_days: days,
        since: since.toISOString(),
        total_events: parseInt(total?.count || '0', 10),
        by_status: byStatus.map((r: any) => ({ status: r.status, count: parseInt(r.count, 10) })),
        by_provider: byProvider.map((r: any) => ({ provider: r.provider, count: parseInt(r.count, 10) })),
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Força retry imediato (admin clicou "tentar de novo agora"). */
  public async retry({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');
      const item = await WebhookDeadLetterItem.find(id);
      if (!item) throw new AppError(AppError.NOT_FOUND, 'DLQ item não encontrado');
      if (item.status === 'resolved') {
        return responseWithSuccess(response, { id, status: 'resolved', message: 'Já estava resolvido' });
      }

      // Reset attempt counter pra dar uma chance fresca
      item.status = 'processing';
      item.attempts += 1;
      item.nextAttemptAt = null;
      await item.save();

      try {
        const payload = JSON.parse(item.payload);
        await WebhookRetryQueueService.runHandler(item.provider, payload, item.eventType);
        item.status = 'resolved';
        item.resolvedAt = DateTime.now();
        item.lastError = null;
        await item.save();
        return responseWithSuccess(response, {
          id,
          status: 'resolved',
          message: 'Reprocessado com sucesso',
        });
      } catch (handlerErr: any) {
        item.status = item.attempts >= item.maxAttempts ? 'failed' : 'pending';
        item.lastError = String(handlerErr?.message || handlerErr).slice(0, 480);
        item.nextAttemptAt = DateTime.now().plus({ minutes: 5 });
        await item.save();
        throw new AppError(
          AppError.SERVER_ERROR,
          `Retry falhou (attempts=${item.attempts}): ${item.lastError}`
        );
      }
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Marca manualmente como failed (descarta — admin decide não reprocessar). */
  public async discard({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');
      const item = await WebhookDeadLetterItem.find(id);
      if (!item) throw new AppError(AppError.NOT_FOUND, 'DLQ item não encontrado');
      item.status = 'failed';
      item.lastError = (item.lastError || '') + ' [manually discarded by admin]';
      await item.save();
      return responseWithSuccess(response, { id, status: 'failed' });
    } catch (err) {
      return responseWithError(response, err);
    }
  }
}
