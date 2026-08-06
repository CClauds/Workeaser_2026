/**
 * Admin AuditLogController — query interface pra tabela `logs`.
 * Sprint G (HF-SPRINT-G-01).
 *
 * Endpoints:
 *  GET /api/admin/audit-logs                          → lista paginada com filtros
 *    Query params:
 *      module       — filtra por módulo (AUTH, INVOICE, CONTRACT, SUBSCRIPTION, etc.)
 *      action       — filtra por ação (LOGIN_SUCCESS, CREATE, etc.)
 *      user_id      — filtra por user específico
 *      from         — ISO date (created_at >= from)
 *      to           — ISO date (created_at <= to)
 *      page         — default 1
 *      per_page     — default 50, max 200
 *
 * Acesso restrito: middleware adminAuthorization (já existente).
 */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class AuditLogController {
  public async index({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const module = request.input('module');
      const action = request.input('action');
      const userId = request.input('user_id');
      const from = request.input('from');
      const to = request.input('to');
      const page = Math.max(1, Number(request.input('page', 1)));
      const perPage = Math.min(200, Math.max(1, Number(request.input('per_page', 50))));

      const q = Database.from('logs')
        .leftJoin('users', 'logs.user_id', 'users.id')
        .select(
          'logs.id',
          'logs.user_id',
          'users.email as user_email',
          'logs.module',
          'logs.action',
          'logs.identifier',
          'logs.metadata',
          'logs.created_at'
        )
        .orderBy('logs.created_at', 'desc');

      if (module) q.where('logs.module', String(module).toUpperCase());
      if (action) q.where('logs.action', String(action).toUpperCase());
      if (userId) q.where('logs.user_id', Number(userId));
      if (from) q.where('logs.created_at', '>=', new Date(String(from)));
      if (to) q.where('logs.created_at', '<=', new Date(String(to)));

      const result = await q.paginate(page, perPage);

      // Adonis paginator usa snake_case; manter consistente
      return responseWithPagination(response, {
        toJSON: () => ({
          data: result.all().map((row: any) => ({
            ...row,
            metadata: this.parseMetadata(row.metadata),
          })),
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

  /** Estatísticas agregadas dos últimos N dias pra dashboard admin. */
  public async stats({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'private, max-age=60');
    try {
      const days = Math.min(90, Math.max(1, Number(request.input('days', 7))));
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Top módulos
      const byModule = await Database.from('logs')
        .where('created_at', '>=', since)
        .groupBy('module')
        .select('module')
        .count('* as count')
        .orderBy('count', 'desc')
        .limit(10);

      // Top ações
      const byAction = await Database.from('logs')
        .where('created_at', '>=', since)
        .groupBy('module', 'action')
        .select('module', 'action')
        .count('* as count')
        .orderBy('count', 'desc')
        .limit(20);

      // Login failures (segurança)
      const loginFailuresRow: any = await Database.from('logs')
        .where('module', 'AUTH')
        .where('action', 'LOGIN_FAILURE')
        .where('created_at', '>=', since)
        .count('* as count')
        .first();

      // Users mais ativos
      const topUsers = await Database.from('logs')
        .leftJoin('users', 'logs.user_id', 'users.id')
        .where('logs.created_at', '>=', since)
        .groupBy('logs.user_id', 'users.email')
        .select('logs.user_id', 'users.email')
        .count('logs.id as count')
        .orderBy('count', 'desc')
        .limit(10);

      const total: any = await Database.from('logs')
        .where('created_at', '>=', since)
        .count('* as count')
        .first();

      return responseWithSuccess(response, {
        period_days: days,
        since: since.toISOString(),
        total_events: parseInt(total?.count || '0', 10),
        login_failures: parseInt(loginFailuresRow?.count || '0', 10),
        by_module: byModule.map((r: any) => ({ module: r.module, count: parseInt(r.count, 10) })),
        by_action: byAction.map((r: any) => ({
          module: r.module,
          action: r.action,
          count: parseInt(r.count, 10),
        })),
        top_users: topUsers.map((r: any) => ({
          user_id: r.user_id,
          email: r.email,
          count: parseInt(r.count, 10),
        })),
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Detalhe de 1 log específico. */
  public async show({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');

      const row: any = await Database.from('logs')
        .leftJoin('users', 'logs.user_id', 'users.id')
        .select(
          'logs.id',
          'logs.user_id',
          'users.email as user_email',
          'logs.module',
          'logs.action',
          'logs.identifier',
          'logs.metadata',
          'logs.created_at'
        )
        .where('logs.id', id)
        .first();

      if (!row) throw new AppError(AppError.NOT_FOUND, 'Log não encontrado');
      row.metadata = this.parseMetadata(row.metadata);

      return responseWithSuccess(response, row);
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  private parseMetadata(raw: unknown): Record<string, unknown> | null {
    if (raw == null) return null;
    if (typeof raw === 'object') return raw as Record<string, unknown>;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return { _raw: raw };
      }
    }
    return null;
  }
}
