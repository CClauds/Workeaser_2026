/**
 * Admin DiscountsController — CRUD básico de cupons + validação pública.
 * Sprint H (HF-SPRINT-H-04).
 *
 * Endpoints:
 *  GET    /api/admin/discounts            → listar
 *  POST   /api/admin/discounts            → criar
 *  POST   /api/admin/discounts/:id/deactivate
 *  GET    /api/cowork/subscriptions/validate-discount?code=X&plan_id=Y → cliente valida ANTES de subscribe
 */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DateTime } from 'luxon';
import AppError from 'App/Utils/AppError';
import { responseWithError, responseWithPagination, responseWithSuccess } from 'App/Utils/ResponseApi';
import DiscountCodeService from 'App/Services/DiscountCodeService';
import SubscriptionPlan from 'App/Models/SubscriptionPlan';

export default class DiscountsController {
  public async index({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const page = Number(request.input('page', 1));
      const perPage = Number(request.input('per_page', 20));
      const active = request.input('active');
      const result = await DiscountCodeService.list({
        page,
        perPage,
        active: active === undefined ? undefined : active === 'true' || active === true,
      });
      return responseWithPagination(response, result);
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async store({ request, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const body = request.only([
        'code',
        'description',
        'discount_type',
        'discount_value',
        'currency',
        'stripe_coupon_id',
        'max_redemptions',
        'max_per_user',
        'restricted_to_plan_ids',
        'valid_from',
        'valid_until',
      ]);

      const dc = await DiscountCodeService.create({
        code: body.code,
        description: body.description,
        discountType: body.discount_type,
        discountValue: Number(body.discount_value),
        currency: body.currency,
        stripeCouponId: body.stripe_coupon_id,
        maxRedemptions: body.max_redemptions === null ? null : Number(body.max_redemptions),
        maxPerUser: body.max_per_user ? Number(body.max_per_user) : 1,
        restrictedToPlanIds: Array.isArray(body.restricted_to_plan_ids)
          ? body.restricted_to_plan_ids.map(Number).filter(Boolean)
          : undefined,
        validFrom: body.valid_from ? DateTime.fromISO(body.valid_from) : undefined,
        validUntil: body.valid_until ? DateTime.fromISO(body.valid_until) : undefined,
      });

      return response.status(201).json({ status: 'OK', result: dc.toJSON(), error: null });
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  public async deactivate({ params, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const id = Number(params.id);
      if (!id) throw new AppError(AppError.VALIDATION_FAIL, 'id inválido');
      const dc = await DiscountCodeService.deactivate(id);
      return responseWithSuccess(response, dc.toJSON());
    } catch (err) {
      return responseWithError(response, err);
    }
  }

  /**
   * HF-SPRINT-H-04: endpoint público (auth) pra cliente validar cupom antes de subscribe.
   * GET /api/cowork/subscriptions/validate-discount?code=X&plan_id=Y
   */
  public async validatePublic({ request, auth, response }: HttpContextContract) {
    response.header('Cache-Control', 'no-cache, no-store');
    try {
      const code = String(request.input('code', '')).trim();
      const planId = Number(request.input('plan_id'));
      if (!code || !planId) {
        throw new AppError(AppError.VALIDATION_FAIL, 'code + plan_id obrigatórios');
      }
      const user = auth.user;
      if (!user) throw new AppError(AppError.UNAUTHORIZED, 'Não autenticado');

      const plan = await SubscriptionPlan.find(planId);
      if (!plan) throw new AppError(AppError.NOT_FOUND, 'Plano não encontrado');

      const result = await DiscountCodeService.validate(code, user.id, planId, plan.amountCents);
      // Retorna sucesso sempre 200 — `valid: false/true` indica resultado
      return responseWithSuccess(response, result);
    } catch (err) {
      return responseWithError(response, err);
    }
  }
}
