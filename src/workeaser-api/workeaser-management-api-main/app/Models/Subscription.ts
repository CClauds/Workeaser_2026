/**
 * Subscription — modelo Lucid para subscriptions.
 * Sprint A (HF-SPRINT-A-03).
 *
 * Espelha o estado do Stripe Subscription localmente. Atualizado via webhook
 * `customer.subscription.*`. Sempre Stripe é fonte da verdade — local é cache
 * para queries rápidas e isolamento de dependência (se Stripe cair, ainda dá
 * pra responder "qual é seu plano").
 */
import { BaseModel, BelongsTo, belongsTo, column, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm';
import { DateTime } from 'luxon';
import SubscriptionPlan from './SubscriptionPlan';

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export default class Subscription extends BaseModel {
  public static namingStrategy = new SnakeCaseNamingStrategy();
  public static table = 'subscriptions';

  public static fillable = [
    'subscriptionPlanId',
    'coworkAccountId',
    'clientAccountId',
    'userId',
    'stripeSubscriptionId',
    'stripeCustomerId',
    'status',
    'currentPeriodStart',
    'currentPeriodEnd',
    'cancelAt',
    'canceledAt',
    'trialEnd',
    'metadata',
  ];

  @column({ isPrimary: true })
  public id: number;

  @column()
  public subscriptionPlanId: number;

  @column()
  public coworkAccountId: number | null;

  @column()
  public clientAccountId: number | null;

  @column()
  public userId: number | null;

  @column()
  public stripeSubscriptionId: string | null;

  @column()
  public stripeCustomerId: string | null;

  @column()
  public status: SubscriptionStatus;

  @column.dateTime()
  public currentPeriodStart: DateTime | null;

  @column.dateTime()
  public currentPeriodEnd: DateTime | null;

  @column.dateTime()
  public cancelAt: DateTime | null;

  @column.dateTime()
  public canceledAt: DateTime | null;

  @column.dateTime()
  public trialEnd: DateTime | null;

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
  public metadata: Record<string, unknown> | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column.dateTime()
  public deletedAt: DateTime | null;

  // HF-SPRINT-H-07: contador de extensões self-service (max 1, max 7 dias por extensão)
  @column()
  public selfServiceTrialExtensions: number;

  @belongsTo(() => SubscriptionPlan, { foreignKey: 'subscriptionPlanId' })
  public plan: BelongsTo<typeof SubscriptionPlan>;

  /** Helpers */
  public isActive(): boolean {
    return this.status === 'active' || this.status === 'trialing';
  }

  public isInDanger(): boolean {
    return this.status === 'past_due' || this.status === 'unpaid';
  }
}
