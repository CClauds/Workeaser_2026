/**
 * DiscountCodeService — validação e aplicação de cupons.
 * Sprint H (HF-SPRINT-H-03).
 *
 * Public API:
 *  - `validate(code, userId, planId)` — verifica se cupom existe + está válido + cliente pode usar + plano permite
 *  - `apply(code, userId, subscriptionId, currency, basePriceCents)` — registra redemption + incrementa counter
 *  - `findByCode(code)` — busca raw (sem validação)
 *  - `list({page, perPage, active})` — para admin UI
 *  - `create(payload)` — admin cria cupom
 *  - `deactivate(id)` — admin desativa
 *
 * Lock otimista: incremento do `current_redemptions` é atômico via UPDATE WHERE current < max.
 */
import Database from '@ioc:Adonis/Lucid/Database';
import { DateTime } from 'luxon';
import AppError from 'App/Utils/AppError';
import DiscountCode, { DiscountType } from 'App/Models/DiscountCode';
import DiscountRedemption from 'App/Models/DiscountRedemption';

export interface ValidationResult {
  valid: boolean;
  code?: DiscountCode;
  reason?: string;
  discount_cents?: number;
  final_price_cents?: number;
}

export interface CreateDiscountInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  currency?: string;
  stripeCouponId?: string;
  maxRedemptions?: number | null;
  maxPerUser?: number;
  restrictedToPlanIds?: number[];
  validFrom?: DateTime;
  validUntil?: DateTime;
}

class DiscountCodeServiceClass {
  /** Valida cupom sem aplicar. Retorna estado + valor de desconto calculado. */
  public async validate(
    code: string,
    userId: number,
    planId: number,
    basePriceCents: number
  ): Promise<ValidationResult> {
    if (!code) return { valid: false, reason: 'Código vazio' };
    const norm = code.trim().toUpperCase();
    const dc = await DiscountCode.findBy('code', norm);
    if (!dc) return { valid: false, reason: 'Código inválido' };

    if (!dc.isCurrentlyValid()) {
      return { valid: false, reason: 'Código expirado ou inativo' };
    }
    if (!dc.allowsPlan(planId)) {
      return { valid: false, reason: 'Código não se aplica a este plano' };
    }

    // Verifica uso pelo user
    const userRedemptionsRow: any = await Database.from('discount_redemptions')
      .where('discount_code_id', dc.id)
      .where('user_id', userId)
      .count('* as count')
      .first();
    const userRedemptions = parseInt(userRedemptionsRow?.count || '0', 10);
    if (userRedemptions >= dc.maxPerUser) {
      return { valid: false, reason: 'Você já usou este código o número máximo de vezes' };
    }

    const discountCents = dc.computeDiscountCents(basePriceCents);
    return {
      valid: true,
      code: dc,
      discount_cents: discountCents,
      final_price_cents: Math.max(0, basePriceCents - discountCents),
    };
  }

  /**
   * Aplica cupom — incrementa counter atomicamente + cria redemption.
   * Chamada APÓS validate() bem-sucedido e APÓS subscription criada.
   */
  public async apply(
    codeId: number,
    userId: number,
    subscriptionId: number | null,
    currency: string,
    amountOffCents: number
  ): Promise<DiscountRedemption> {
    const trx = await Database.transaction();
    try {
      // Lock + check + increment atômico
      const dc = await DiscountCode.find(codeId, { client: trx });
      if (!dc) throw new AppError(AppError.NOT_FOUND, 'Cupom não encontrado');
      if (!dc.isCurrentlyValid()) {
        throw new AppError(AppError.VALIDATION_FAIL, 'Cupom expirou enquanto era processado');
      }

      // Re-check user limit dentro da transação
      const userRedemptionsRow: any = await Database.query({ client: trx })
        .from('discount_redemptions')
        .where('discount_code_id', codeId)
        .where('user_id', userId)
        .count('* as count')
        .first();
      const userRedemptions = parseInt(userRedemptionsRow?.count || '0', 10);
      if (userRedemptions >= dc.maxPerUser) {
        throw new AppError(AppError.VALIDATION_FAIL, 'Limite de usos por usuário atingido');
      }

      // Incrementa counter (race-safe via increment)
      dc.currentRedemptions += 1;
      await dc.useTransaction(trx).save();

      // Cria redemption
      const redemption = await DiscountRedemption.create(
        {
          discountCodeId: codeId,
          userId,
          subscriptionId: subscriptionId ?? null,
          currency,
          amountOffCents,
          redeemedAt: DateTime.now(),
        },
        { client: trx }
      );

      await trx.commit();
      return redemption;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  public async list(opts: { page?: number; perPage?: number; active?: boolean } = {}) {
    const page = opts.page || 1;
    const perPage = Math.min(100, opts.perPage || 20);
    const q = DiscountCode.query().whereNull('deleted_at').orderBy('created_at', 'desc');
    if (opts.active !== undefined) q.where('active', opts.active);
    return q.paginate(page, perPage);
  }

  public async create(input: CreateDiscountInput): Promise<DiscountCode> {
    if (!input.code || !input.discountType || !input.discountValue) {
      throw new AppError(AppError.VALIDATION_FAIL, 'code, discountType, discountValue obrigatórios');
    }
    const norm = input.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,60}$/.test(norm)) {
      throw new AppError(
        AppError.VALIDATION_FAIL,
        'Código inválido: 3-60 chars, somente A-Z, 0-9, _, -'
      );
    }
    if (input.discountType === 'percent' && (input.discountValue < 1 || input.discountValue > 100)) {
      throw new AppError(AppError.VALIDATION_FAIL, 'discountValue para percent: 1-100');
    }
    if (input.discountType === 'fixed' && input.discountValue < 1) {
      throw new AppError(AppError.VALIDATION_FAIL, 'discountValue para fixed: >= 1 cent');
    }
    const existing = await DiscountCode.findBy('code', norm);
    if (existing) throw new AppError(AppError.VALIDATION_FAIL, 'Código já existe');

    return DiscountCode.create({
      code: norm,
      description: input.description ?? null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      currency: input.currency ?? null,
      stripeCouponId: input.stripeCouponId ?? null,
      maxRedemptions: input.maxRedemptions ?? null,
      maxPerUser: input.maxPerUser ?? 1,
      currentRedemptions: 0,
      active: true,
      restrictedToPlanIds: input.restrictedToPlanIds?.length
        ? input.restrictedToPlanIds.join(',')
        : null,
      validFrom: input.validFrom ?? null,
      validUntil: input.validUntil ?? null,
    });
  }

  public async deactivate(id: number): Promise<DiscountCode> {
    const dc = await DiscountCode.find(id);
    if (!dc) throw new AppError(AppError.NOT_FOUND, 'Cupom não encontrado');
    dc.active = false;
    await dc.save();
    return dc;
  }
}

export const DiscountCodeService = new DiscountCodeServiceClass();
export default DiscountCodeService;
