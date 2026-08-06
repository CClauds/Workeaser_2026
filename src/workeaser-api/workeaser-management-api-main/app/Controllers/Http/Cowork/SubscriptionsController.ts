/**
 * Cowork SubscriptionsController — Sprint A (HF-SPRINT-A-07).
 *
 * Endpoints REST para cowork gerenciar a própria assinatura Workeaser:
 *  - GET  /api/cowork/subscriptions                 → lista subscriptions do user
 *  - GET  /api/cowork/subscriptions/plans           → lista planos ativos disponíveis
 *  - POST /api/cowork/subscriptions                 → cria nova subscription (card ou PIX)
 *  - POST /api/cowork/subscriptions/:id/cancel      → cancela (default: at_period_end)
 *  - POST /api/cowork/subscriptions/:id/sync        → re-sincroniza com Stripe (recovery)
 *
 * Autorização: middleware auth + cowork (assinante é o owner do cowork ou ADMIN do sistema).
 */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithSuccess } from 'App/Utils/ResponseApi';
import Subscription from 'App/Models/Subscription';
import SubscriptionPlan from 'App/Models/SubscriptionPlan';
// HF-SPRINT-E-04: audit trail
import AuditTrailService from 'App/Services/AuditTrailService';
import StripeSubscriptionService from 'App/Services/Cowork/StripeSubscriptionService';
import CreateSubscriptionValidator from 'App/Validators/Cowork/Subscription/CreateSubscriptionValidator';

export default class SubscriptionsController {
  /** Lista subscriptions do user autenticado. */
  public async index({ auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');
      const subs = await StripeSubscriptionService.listForUser(user.id);
      return responseWithSuccess(response, subs.map((s) => s.toJSON()));
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Lista planos disponíveis pra contratação. */
  public async listPlans({ response }: HttpContextContract) {
    response.header('Cache-Control', 'public, max-age=300'); // 5 min de cache (planos mudam pouco)
    try {
      const plans = await SubscriptionPlan.query()
        .where('active', true)
        .whereNull('deleted_at')
        .orderBy('amount_cents', 'asc');
      return responseWithSuccess(response, plans.map((p) => p.toJSON()));
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Cria nova subscription. Body: { plan_id, payment_method_id?, use_pix?, trial_days? } */
  public async store(ctx: HttpContextContract) {
    const { auth, request, response } = ctx;
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');
      const payload = await request.validate(CreateSubscriptionValidator);

      // Regra: precisa de payment_method_id OU use_pix=true
      if (!payload.payment_method_id && !payload.use_pix) {
        throw new AppError(
          AppError.VALIDATION_FAIL,
          'É preciso informar payment_method_id (cartão) ou use_pix=true'
        );
      }

      const result = await StripeSubscriptionService.create({
        userId: user.id,
        planId: payload.plan_id,
        paymentMethodId: payload.payment_method_id,
        usePix: payload.use_pix,
        trialDays: payload.trial_days,
        // HF-SPRINT-I-01: discount_code opcional
        discountCode: (payload as any).discount_code,
      });

      // HF-SPRINT-E-04: audit
      try {
        const plan = await SubscriptionPlan.find(payload.plan_id);
        void AuditTrailService.subscriptionCreated(
          ctx,
          result.subscriptionId,
          plan?.code || String(payload.plan_id),
          payload.use_pix ? 'pix' : 'card'
        );
      } catch { /* audit silencioso */ }

      return response.status(201).json({
        status: 'OK',
        result,
        error: null,
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Cancela subscription. Body opcional: { at_period_end: boolean (default true) } */
  public async cancel({ auth, request, params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const id = Number(params.id);
      const sub = await Subscription.find(id);
      if (!sub) throw new AppError(AppError.NOT_FOUND, 'Subscription não encontrada');
      if (sub.userId !== user.id) {
        // Não vaza existência: 404 em vez de 403
        throw new AppError(AppError.NOT_FOUND, 'Subscription não encontrada');
      }

      const atPeriodEnd = request.input('at_period_end', true) !== false;
      await StripeSubscriptionService.cancel(id, atPeriodEnd);
      void AuditTrailService.subscriptionCanceled({ auth, request, params, response } as any, id, atPeriodEnd);
      return responseWithSuccess(response, { canceled: true, at_period_end: atPeriodEnd });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /** Força sincronização local com Stripe (útil em recovery de webhook perdido). */
  public async sync({ auth, params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const id = Number(params.id);
      const sub = await Subscription.find(id);
      if (!sub || sub.userId !== user.id) {
        throw new AppError(AppError.NOT_FOUND, 'Subscription não encontrada');
      }
      const updated = await StripeSubscriptionService.syncFromStripe(id);
      return responseWithSuccess(response, updated.toJSON());
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /**
   * HF-SPRINT-H-07: self-service trial extension.
   * Cliente pode estender SEU PRÓPRIO trial 1x por subscription, +7 dias.
   * POST /api/cowork/subscriptions/:id/extend-trial-self-service
   */
  public async extendTrialSelfService(ctx: HttpContextContract) {
    const { auth, params, response } = ctx;
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const id = Number(params.id);
      const sub = await Subscription.find(id);
      if (!sub || sub.userId !== user.id) {
        throw new AppError(AppError.NOT_FOUND, 'Subscription não encontrada');
      }
      if (sub.status !== 'trialing') {
        throw new AppError(
          AppError.VALIDATION_FAIL,
          `Extensão self-service só disponível em status 'trialing'. Status atual: ${sub.status}.`
        );
      }
      if ((sub.selfServiceTrialExtensions || 0) >= 1) {
        throw new AppError(
          AppError.VALIDATION_FAIL,
          'Você já usou sua extensão self-service. Para mais tempo, contate suporte.'
        );
      }

      const nowUnix = Math.floor(Date.now() / 1000);
      const currentTrialEndUnix = sub.trialEnd ? Math.floor(sub.trialEnd.toSeconds()) : nowUnix;
      const baselineUnix = Math.max(currentTrialEndUnix, nowUnix);
      const newTrialEndUnix = baselineUnix + 7 * 86400;

      const updated = await StripeSubscriptionService.extendTrial(id, newTrialEndUnix);
      updated.selfServiceTrialExtensions = (updated.selfServiceTrialExtensions || 0) + 1;
      await updated.save();

      void AuditTrailService.log('SUBSCRIPTION', 'TRIAL_EXTEND_SELF_SERVICE', {
        ctx,
        identifier: id,
        metadata: { days_added: 7 },
      });

      return responseWithSuccess(response, {
        id: updated.id,
        status: updated.status,
        trial_end: updated.trialEnd?.toISO(),
        extensions_used: updated.selfServiceTrialExtensions,
        extensions_remaining: Math.max(0, 1 - updated.selfServiceTrialExtensions),
        message: 'Trial estendido por +7 dias. Aproveite!',
      });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /**
   * HF-SPRINT-F-02: cria session Stripe Customer Portal.
   * POST /api/cowork/subscriptions/portal-session
   * Body: { return_url?: string }  (default: '/settings/subscriptions')
   */
  public async portalSession(ctx: HttpContextContract) {
    const { auth, request, response } = ctx;
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      const returnPath = String(request.input('return_url', '/settings/subscriptions'));
      // Sanitiza: só permite caminho relativo na mesma origem (anti-open-redirect)
      const safePath = returnPath.startsWith('/') && !returnPath.startsWith('//')
        ? returnPath
        : '/settings/subscriptions';
      const returnUrl = `${baseUrl}${safePath}`;
      const result = await StripeSubscriptionService.createPortalSession(user.id, returnUrl);
      return responseWithSuccess(response, result);
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /**
   * HF-SPRINT-F-05: mudar plano de subscription existente (upgrade/downgrade).
   * POST /api/cowork/subscriptions/:id/change-plan
   * Body: { new_plan_id: number, proration_behavior?: 'create_prorations'|'none'|'always_invoice' }
   */
  public async changePlan(ctx: HttpContextContract) {
    const { auth, request, params, response } = ctx;
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const id = Number(params.id);
      const sub = await Subscription.find(id);
      if (!sub || sub.userId !== user.id) {
        throw new AppError(AppError.NOT_FOUND, 'Subscription não encontrada');
      }

      const newPlanId = Number(request.input('new_plan_id'));
      if (!newPlanId) throw new AppError(AppError.VALIDATION_FAIL, 'new_plan_id obrigatório');
      const rawProration = String(request.input('proration_behavior', 'create_prorations'));
      const allowed = ['create_prorations', 'none', 'always_invoice'] as const;
      const proration: typeof allowed[number] = (allowed as readonly string[]).includes(rawProration)
        ? (rawProration as typeof allowed[number])
        : 'create_prorations';

      const updated = await StripeSubscriptionService.changePlan(id, newPlanId, proration);

      // Audit log
      try {
        const newPlan = await SubscriptionPlan.find(newPlanId);
        void AuditTrailService.log('SUBSCRIPTION', 'CHANGE_PLAN', {
          ctx,
          identifier: id,
          metadata: {
            new_plan_code: newPlan?.code,
            proration_behavior: proration,
          },
        });
      } catch { /* audit silencioso */ }

      return responseWithSuccess(response, updated.toJSON());
    } catch (err) {
      return responseWithError(response, err);
    }
  }
}
