/**
 * SubscriptionMetricsService — métricas SaaS clássicas baseadas em Stripe Subscriptions.
 * Sprint D (HF-SPRINT-D-08).
 *
 * Métricas calculadas:
 *  - MRR (Monthly Recurring Revenue) = soma de amount_cents / interval_months das assinaturas ativas
 *  - ARR (Annual Recurring Revenue) = MRR × 12
 *  - ARPU (Average Revenue Per User) = MRR / # assinantes ativos
 *  - Churn rate (mensal) = cancelamentos no mês / assinantes no início do mês
 *  - Plan distribution = qtd por plano
 *  - Growth = MRR atual vs MRR 30 dias atrás
 *
 * Considera "ativo" = subscription.status IN ('active', 'trialing').
 * Trial não contribui pra MRR (mas conta como assinante pra ARPU).
 * Valores em centavos no banco — convertidos pra unidade na resposta JSON.
 */
import Database from '@ioc:Adonis/Lucid/Database';
import { DateTime } from 'luxon';

export interface SubscriptionMetrics {
  generated_at: string;
  currency: string; // assume tudo numa moeda só por enquanto; multi-moeda na próxima
  active_subscribers: number;
  paying_subscribers: number; // exclui trialing
  mrr: number;
  mrr_cents: number;
  arr: number;
  arr_cents: number;
  arpu: number;
  arpu_cents: number;
  trialing: number;
  past_due: number;
  canceled_last_30d: number;
  churn_rate_30d_pct: number;
  growth_30d_pct: number; // vs MRR de 30d atrás
  by_plan: Array<{
    plan_id: number;
    plan_code: string;
    plan_name: string;
    active_count: number;
    mrr_contribution_cents: number;
  }>;
}

class SubscriptionMetricsServiceClass {
  public async compute(): Promise<SubscriptionMetrics> {
    const now = DateTime.now();
    const thirtyDaysAgo = now.minus({ days: 30 }).toJSDate();
    const sixtyDaysAgo = now.minus({ days: 60 }).toJSDate();

    // Active subscriptions com plan joined
    const activeRows = await Database.from('subscriptions')
      .join('subscription_plans', 'subscriptions.subscription_plan_id', 'subscription_plans.id')
      .whereIn('subscriptions.status', ['active', 'trialing'])
      .whereNull('subscriptions.deleted_at')
      .select(
        'subscriptions.id as sub_id',
        'subscriptions.status as sub_status',
        'subscription_plans.id as plan_id',
        'subscription_plans.code as plan_code',
        'subscription_plans.name as plan_name',
        'subscription_plans.amount_cents',
        'subscription_plans.currency',
        'subscription_plans.interval'
      );

    let mrrCents = 0;
    let payingSubscribers = 0;
    let trialing = 0;
    const currencies = new Set<string>();
    const byPlanMap = new Map<number, { plan_id: number; plan_code: string; plan_name: string; active_count: number; mrr_contribution_cents: number }>();

    for (const row of activeRows) {
      currencies.add(row.currency);
      const monthlyContribution =
        row.interval === 'yearly' ? Math.round(row.amount_cents / 12) : row.amount_cents;

      if (row.sub_status === 'active') {
        mrrCents += monthlyContribution;
        payingSubscribers++;
      } else if (row.sub_status === 'trialing') {
        trialing++;
        // trial não contribui MRR
      }

      const existing = byPlanMap.get(row.plan_id);
      if (existing) {
        existing.active_count++;
        if (row.sub_status === 'active') existing.mrr_contribution_cents += monthlyContribution;
      } else {
        byPlanMap.set(row.plan_id, {
          plan_id: row.plan_id,
          plan_code: row.plan_code,
          plan_name: row.plan_name,
          active_count: 1,
          mrr_contribution_cents: row.sub_status === 'active' ? monthlyContribution : 0,
        });
      }
    }

    const activeSubscribers = activeRows.length;

    // Past due
    const pastDueRow: any = await Database.from('subscriptions')
      .where('status', 'past_due')
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    const pastDue = parseInt(pastDueRow?.count || '0', 10);

    // Cancelados nos últimos 30d
    const canceledRow: any = await Database.from('subscriptions')
      .where('status', 'canceled')
      .where('canceled_at', '>=', thirtyDaysAgo)
      .count('* as count')
      .first();
    const canceledLast30d = parseInt(canceledRow?.count || '0', 10);

    // Assinantes ativos no início do mês (active OU canceled no período mas que estavam ativos antes)
    // Simplificação: usar created_at < thirtyDaysAgo + (active hoje OU canceled depois)
    const activeAtStartRow: any = await Database.from('subscriptions')
      .where('created_at', '<=', thirtyDaysAgo)
      .where((q) => {
        q.whereIn('status', ['active', 'trialing', 'past_due']).orWhere((q2) => {
          q2.where('status', 'canceled').where('canceled_at', '>=', thirtyDaysAgo);
        });
      })
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    const activeAtStart = parseInt(activeAtStartRow?.count || '0', 10);

    const churnRate = activeAtStart > 0 ? (canceledLast30d / activeAtStart) * 100 : 0;

    // MRR 30 dias atrás (snapshot aproximado) — assume que o que existia naquela época e não foi cancelado conta
    const mrr30dRows = await Database.from('subscriptions')
      .join('subscription_plans', 'subscriptions.subscription_plan_id', 'subscription_plans.id')
      .where('subscriptions.created_at', '<=', thirtyDaysAgo)
      .where((q) => {
        q.where('subscriptions.status', 'active')
          .orWhereNull('subscriptions.canceled_at')
          .orWhere('subscriptions.canceled_at', '>=', thirtyDaysAgo);
      })
      .whereNull('subscriptions.deleted_at')
      .select('subscription_plans.amount_cents', 'subscription_plans.interval', 'subscriptions.status');

    let mrr30dCents = 0;
    for (const row of mrr30dRows) {
      if (row.status !== 'active' && row.status !== 'trialing' && row.status !== 'past_due') continue;
      const contrib = row.interval === 'yearly' ? Math.round(row.amount_cents / 12) : row.amount_cents;
      if (row.status === 'active' || row.status === 'past_due') mrr30dCents += contrib;
    }

    const growthPct = mrr30dCents > 0 ? ((mrrCents - mrr30dCents) / mrr30dCents) * 100 : 0;

    const arrCents = mrrCents * 12;
    const arpuCents = payingSubscribers > 0 ? Math.round(mrrCents / payingSubscribers) : 0;

    void sixtyDaysAgo; // reservado pra cohort analysis futura

    return {
      generated_at: now.toISO() || '',
      currency: currencies.size === 1 ? Array.from(currencies)[0] : 'MIXED',
      active_subscribers: activeSubscribers,
      paying_subscribers: payingSubscribers,
      mrr: mrrCents / 100,
      mrr_cents: mrrCents,
      arr: arrCents / 100,
      arr_cents: arrCents,
      arpu: arpuCents / 100,
      arpu_cents: arpuCents,
      trialing,
      past_due: pastDue,
      canceled_last_30d: canceledLast30d,
      churn_rate_30d_pct: Math.round(churnRate * 100) / 100,
      growth_30d_pct: Math.round(growthPct * 100) / 100,
      by_plan: Array.from(byPlanMap.values()).sort((a, b) => b.active_count - a.active_count),
    };
  }
}

/**
 * HF-SPRINT-G-03: Cohort retention analysis.
 *
 * Cohort = subscriptions criadas no mesmo mês.
 * Para cada cohort, calcula % ainda ativo em meses subsequentes.
 *
 * SaaS saudável: >85% mês 1, >75% mês 3, >60% mês 12.
 */
export interface CohortMonth {
  m: number;
  active: number;
  retention_pct: number;
}

export interface CohortRetention {
  cohort_key: string;
  cohort_year: number;
  cohort_month: number;
  initial_count: number;
  months: CohortMonth[];
}

class CohortAnalysisServiceClass {
  public async compute(monthsBack = 12): Promise<CohortRetention[]> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    const rows = await Database.from('subscriptions')
      .where('created_at', '>=', startDate)
      .whereNull('deleted_at')
      .select('id', 'created_at', 'status', 'canceled_at');

    const cohorts = new Map<string, { year: number; month: number; subs: any[] }>();
    for (const row of rows) {
      const created = new Date(row.created_at);
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
      if (!cohorts.has(key)) {
        cohorts.set(key, { year: created.getFullYear(), month: created.getMonth() + 1, subs: [] });
      }
      cohorts.get(key)!.subs.push(row);
    }

    const result: CohortRetention[] = [];
    for (const [key, cohort] of cohorts) {
      if (cohort.subs.length < 3) continue; // estatística pouco significativa
      const monthsSinceCreation = Math.min(
        12,
        (now.getFullYear() - cohort.year) * 12 + (now.getMonth() + 1 - cohort.month)
      );

      const months: CohortMonth[] = [];
      for (let m = 0; m <= monthsSinceCreation; m++) {
        const nextMonth = new Date(cohort.year, cohort.month - 1 + m + 1, 1);
        const active = cohort.subs.filter((s) => {
          if (new Date(s.created_at).getTime() > nextMonth.getTime()) return false;
          if (!s.canceled_at) return ['active', 'trialing', 'past_due'].includes(s.status);
          return new Date(s.canceled_at).getTime() >= nextMonth.getTime();
        }).length;
        const retention = cohort.subs.length > 0 ? (active / cohort.subs.length) * 100 : 0;
        months.push({ m, active, retention_pct: Math.round(retention * 10) / 10 });
      }

      result.push({
        cohort_key: key,
        cohort_year: cohort.year,
        cohort_month: cohort.month,
        initial_count: cohort.subs.length,
        months,
      });
    }

    result.sort((a, b) => a.cohort_key.localeCompare(b.cohort_key));
    return result;
  }
}

export const CohortAnalysisService = new CohortAnalysisServiceClass();

export const SubscriptionMetricsService = new SubscriptionMetricsServiceClass();
export default SubscriptionMetricsService;
