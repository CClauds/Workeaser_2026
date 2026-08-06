/**
 * DiscountCode + DiscountRedemption — modelos Lucid.
 * Sprint H (HF-SPRINT-H-02).
 */
import { BaseModel, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';

export type DiscountType = 'percent' | 'fixed';

export default class DiscountCode extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'discount_codes';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public code: string;

  @column()
  public description: string | null;

  @column()
  public discountType: DiscountType;

  @column()
  public discountValue: number;

  @column()
  public currency: string | null;

  @column()
  public stripeCouponId: string | null;

  @column()
  public maxRedemptions: number | null;

  @column()
  public maxPerUser: number;

  @column()
  public currentRedemptions: number;

  @column()
  public active: boolean;

  /** CSV de plan_ids permitidos. null = aplica em todos. */
  @column()
  public restrictedToPlanIds: string | null;

  @column.dateTime()
  public validFrom: DateTime | null;

  @column.dateTime()
  public validUntil: DateTime | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column.dateTime()
  public deletedAt: DateTime | null;

  /** True se cupom está válido agora (não expirado, ativo, sem ter estourado limite global). */
  public isCurrentlyValid(): boolean {
    if (!this.active || this.deletedAt) return false;
    const now = DateTime.now();
    if (this.validFrom && now < this.validFrom) return false;
    if (this.validUntil && now > this.validUntil) return false;
    if (this.maxRedemptions !== null && this.currentRedemptions >= this.maxRedemptions) return false;
    return true;
  }

  /** Aplica em planId? */
  public allowsPlan(planId: number): boolean {
    if (!this.restrictedToPlanIds) return true;
    const allowed = this.restrictedToPlanIds.split(',').map((s) => Number(s.trim())).filter(Boolean);
    return allowed.includes(planId);
  }

  /** Calcula desconto em centavos pra um valor base. */
  public computeDiscountCents(basePriceCents: number): number {
    if (this.discountType === 'percent') {
      const pct = Math.min(100, Math.max(0, this.discountValue));
      return Math.round((basePriceCents * pct) / 100);
    }
    // fixed: discountValue já é cents
    return Math.min(this.discountValue, basePriceCents);
  }
}
