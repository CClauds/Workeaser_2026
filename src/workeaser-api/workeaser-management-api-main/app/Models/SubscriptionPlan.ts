/**
 * SubscriptionPlan — modelo Lucid para subscription_plans.
 * Sprint A (HF-SPRINT-A-02).
 *
 * Representa um plano vendável (ex: Solo USD 49/mês, Growth USD 149/mês).
 * Cada plano referencia 1 stripe_price_id (criado manualmente no painel Stripe
 * ou via API durante setup).
 */
import { BaseModel, column, HasMany, hasMany, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';
import Subscription from './Subscription';

export type SubscriptionInterval = 'monthly' | 'yearly';

export default class SubscriptionPlan extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'subscription_plans';

  public static fillable = [
    'code',
    'name',
    'description',
    'currency',
    'amountCents',
    'interval',
    'stripePriceId',
    'features',
    'active',
  ];

  @column({ isPrimary: true })
  public id: number;

  @column()
  public code: string;

  @column()
  public name: string;

  @column()
  public description: string | null;

  @column()
  public currency: string;

  @column()
  public amountCents: number;

  @column()
  public interval: SubscriptionInterval;

  @column()
  public stripePriceId: string | null;

  @column({
    prepare: (v: unknown) => (v == null ? null : JSON.stringify(v)),
    consume: (v: unknown) => {
      if (v == null) return null;
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return null; }
      }
      return v;
    },
  })
  public features: Record<string, unknown> | null;

  @column()
  public active: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column.dateTime()
  public deletedAt: DateTime | null;

  @hasMany(() => Subscription, { foreignKey: 'subscriptionPlanId' })
  public subscriptions: HasMany<typeof Subscription>;
}
