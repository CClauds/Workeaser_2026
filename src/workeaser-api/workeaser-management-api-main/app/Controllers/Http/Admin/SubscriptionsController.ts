import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import SubscriptionService from 'App/Services/Admin/SubscriptionService';
// HF-SPRINT-D-09: métricas agregadas SaaS (MRR/ARR/Churn/ARPU)
import SubscriptionMetricsService, { CohortAnalysisService } from 'App/Services/Admin/SubscriptionMetricsService';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';

export default class SubscriptionController {
  public async show({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const coworkAccountId = params.cowork_account_id;

      if (!coworkAccountId) {
        throw new AppError(AppError.BAD_REQUEST, 'cowork_account_id is required');
      }

      const resource = await SubscriptionService.show(coworkAccountId);

      return responseWithSuccess(response, resource);
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  /**
   * HF-SPRINT-D-09: GET /api/admin/subscriptions/metrics
   * Devolve MRR, ARR, ARPU, Churn 30d, growth 30d, distribuição por plano.
   * Usado em dashboard interno do Workeaser admin.
   */
  public async metrics({ response }: HttpContextContract) {
    response.header('Cache-Control', 'private, max-age=60'); // cache 1 min
    try {
      const data = await SubscriptionMetricsService.compute();
      return responseWithSuccess(response, data);
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  /**
   * HF-SPRINT-G-05: POST /api/admin/subscriptions/:id/extend-trial
   * Body: { extend_days: number } (1..730)
   */
  public async extendTrial({ params, request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');
      const extendDays = Number(request.input('extend_days'));
      if (!extendDays || extendDays < 1 || extendDays > 730) {
        throw new AppError(AppError.VALIDATION_FAIL, 'extend_days deve estar entre 1 e 730');
      }
      const { default: StripeSubService } = await import('App/Services/Cowork/StripeSubscriptionService');
      const newTrialEndUnix = Math.floor(Date.now() / 1000) + extendDays * 86400;
      const updated = await StripeSubService.extendTrial(id, newTrialEndUnix);
      return responseWithSuccess(response, {
        id: updated.id,
        status: updated.status,
        trial_end: updated.trialEnd?.toISO(),
        message: `Trial estendido por ${extendDays} dias.`,
      });
    } catch (error) {
      return responseWithError(response, error);
    }
  }

  /**
   * HF-SPRINT-G-03: GET /api/admin/subscriptions/cohorts
   * Devolve retenção por cohort (mês de criação × meses subsequentes).
   * Query: months_back (default 12, max 24)
   */
  public async cohorts({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'private, max-age=300'); // cache 5min
    try {
      const monthsBack = Math.min(24, Math.max(1, Number(request.input('months_back', 12))));
      const data = await CohortAnalysisService.compute(monthsBack);
      return responseWithSuccess(response, {
        months_back: monthsBack,
        cohorts: data,
        generated_at: new Date().toISOString(),
      });
    } catch (error) {
      return responseWithError(response, error);
    }
  }
}
