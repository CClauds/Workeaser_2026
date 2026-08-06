/**
 * /admin/metrics — Dashboard SaaS (MRR/ARR/Churn/ARPU).
 * Sprint E (HF-SPRINT-E-06).
 *
 * Consome GET /api/admin/subscriptions/metrics.
 * Acesso restrito a usuários ADMIN (proteção no backend via adminAuthorization).
 *
 * Estilo simples — sem dependência de gráficos por enquanto. Métricas em cards
 * grandes + tabela de distribuição por plano. Pode evoluir para Echarts depois.
 */
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface PlanBreakdown {
  plan_id: number;
  plan_code: string;
  plan_name: string;
  active_count: number;
  mrr_contribution_cents: number;
}

interface Metrics {
  generated_at: string;
  currency: string;
  active_subscribers: number;
  paying_subscribers: number;
  mrr: number;
  mrr_cents: number;
  arr: number;
  arpu: number;
  trialing: number;
  past_due: number;
  canceled_last_30d: number;
  churn_rate_30d_pct: number;
  growth_30d_pct: number;
  by_plan: PlanBreakdown[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return { redirect: { destination: "/login?expired=true", permanent: false } };
  }
  return { props: {} };
};

const formatMoney = (value: number, currency: string) => {
  if (currency === "BRL") return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  return `${currency} ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: 8,
  padding: 24,
  flex: "1 1 200px",
  minWidth: 0,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

function MetricCard({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: color || "#222", marginTop: 8 }}>{value}</div>
      {hint && <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

// HF-SPRINT-G-03: Cohort retention types
interface CohortMonth {
  m: number;
  active: number;
  retention_pct: number;
}
interface CohortRow {
  cohort_key: string;
  initial_count: number;
  months: CohortMonth[];
}

const MetricsPage = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const api = getAPIClient();
      const [metricsRes, cohortsRes] = await Promise.all([
        api.get("/admin/subscriptions/metrics"),
        api.get("/admin/subscriptions/cohorts?months_back=6").catch(() => ({ data: { result: { cohorts: [] } } })),
      ]);
      setMetrics(metricsRes.data?.result);
      setCohorts(cohortsRes.data?.result?.cohorts || []);
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || "Falha ao carregar métricas";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <>
      <Head>
        <title>Métricas SaaS | Workeaser Admin</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h1>Métricas SaaS</h1>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            style={{
              background: "transparent",
              color: "#1677ff",
              border: "1px solid #1677ff",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Atualizando..." : "↻ Atualizar"}
          </button>
        </div>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Snapshot do estado atual das assinaturas Workeaser. MRR/ARR/ARPU/Churn agregados.
          {metrics?.generated_at && (
            <span style={{ marginLeft: 8, fontSize: 13 }}>
              · Gerado em: {new Date(metrics.generated_at).toLocaleString("pt-BR")}
            </span>
          )}
        </p>

        {err && !metrics && (
          <div style={{ background: "#fff1f0", padding: 16, borderRadius: 8, marginBottom: 24 }} role="alert">
            ⚠️ {err}
          </div>
        )}

        {loading && !metrics ? (
          <p>Carregando...</p>
        ) : metrics ? (
          <>
            {/* Top metrics */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
              <MetricCard
                label="MRR"
                value={formatMoney(metrics.mrr, metrics.currency)}
                hint={`Growth 30d: ${
                  metrics.growth_30d_pct >= 0 ? "+" : ""
                }${metrics.growth_30d_pct}%`}
                color={metrics.growth_30d_pct >= 0 ? "#52c41a" : "#ff4d4f"}
              />
              <MetricCard
                label="ARR"
                value={formatMoney(metrics.arr, metrics.currency)}
                hint="MRR × 12"
              />
              <MetricCard
                label="ARPU"
                value={`${metrics.currency} ${(metrics.mrr_cents / Math.max(1, metrics.paying_subscribers) / 100).toFixed(2)}`}
                hint="Receita média por usuário pagante"
              />
              <MetricCard
                label="Churn 30d"
                value={`${metrics.churn_rate_30d_pct}%`}
                hint={`${metrics.canceled_last_30d} cancelaram nos últimos 30d`}
                color={metrics.churn_rate_30d_pct > 7 ? "#ff4d4f" : "#52c41a"}
              />
            </div>

            {/* Subscribers breakdown */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
              <MetricCard
                label="Active subscribers"
                value={String(metrics.active_subscribers)}
                hint={`${metrics.paying_subscribers} pagantes + ${metrics.trialing} em trial`}
              />
              <MetricCard
                label="Past due"
                value={String(metrics.past_due)}
                hint="Cobrança falhou, em retry Stripe"
                color={metrics.past_due > 0 ? "#fa8c16" : undefined}
              />
              <MetricCard
                label="Trialing"
                value={String(metrics.trialing)}
                hint="Período grátis ativo (sem MRR contribuição)"
              />
              <MetricCard
                label="Canceled 30d"
                value={String(metrics.canceled_last_30d)}
                hint="Cancelamentos absolutos"
              />
            </div>

            {/* By plan */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 8,
                padding: 24,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Distribuição por plano</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa", textAlign: "left" }}>
                    <th style={{ padding: 12, border: "1px solid #eee" }}>Plano</th>
                    <th style={{ padding: 12, border: "1px solid #eee" }}>Ativos</th>
                    <th style={{ padding: 12, border: "1px solid #eee" }}>MRR contribuição</th>
                    <th style={{ padding: 12, border: "1px solid #eee" }}>% do MRR total</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.by_plan.map((p) => {
                    const pct = metrics.mrr_cents > 0
                      ? ((p.mrr_contribution_cents / metrics.mrr_cents) * 100).toFixed(1)
                      : "0.0";
                    return (
                      <tr key={p.plan_id}>
                        <td style={{ padding: 12, border: "1px solid #eee" }}>
                          <strong>{p.plan_name}</strong>{" "}
                          <span style={{ color: "#999" }}>({p.plan_code})</span>
                        </td>
                        <td style={{ padding: 12, border: "1px solid #eee" }}>{p.active_count}</td>
                        <td style={{ padding: 12, border: "1px solid #eee" }}>
                          {formatMoney(p.mrr_contribution_cents / 100, metrics.currency)}
                        </td>
                        <td style={{ padding: 12, border: "1px solid #eee" }}>{pct}%</td>
                      </tr>
                    );
                  })}
                  {metrics.by_plan.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ padding: 24, textAlign: "center", color: "#999" }}
                      >
                        Nenhum plano ativo ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* HF-SPRINT-G-03: Cohort retention table */}
            {cohorts.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  borderRadius: 8,
                  padding: 24,
                  marginTop: 32,
                }}
              >
                <h3 style={{ marginTop: 0 }}>Retenção por cohort (últimos 6 meses)</h3>
                <p style={{ color: "#666", fontSize: 13 }}>
                  Cada linha = grupo de assinaturas criadas no mesmo mês. Colunas = % do grupo ainda
                  ativo N meses depois. SaaS saudável: &gt;85% no mês 1, &gt;75% no mês 3.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#fafafa" }}>
                        <th style={{ padding: 10, textAlign: "left", border: "1px solid #eee" }}>Cohort</th>
                        <th style={{ padding: 10, textAlign: "left", border: "1px solid #eee" }}>Início</th>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <th key={i} style={{ padding: 10, textAlign: "center", border: "1px solid #eee" }}>
                            M{i}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.map((c) => (
                        <tr key={c.cohort_key}>
                          <td style={{ padding: 10, border: "1px solid #eee", fontWeight: 600 }}>
                            {c.cohort_key}
                          </td>
                          <td style={{ padding: 10, border: "1px solid #eee" }}>{c.initial_count}</td>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const month = c.months.find((m) => m.m === i);
                            const pct = month?.retention_pct;
                            const color =
                              pct === undefined
                                ? "transparent"
                                : pct >= 80
                                ? "#d9f7be"
                                : pct >= 60
                                ? "#fffbe6"
                                : "#fff1f0";
                            return (
                              <td
                                key={i}
                                style={{
                                  padding: 10,
                                  textAlign: "center",
                                  border: "1px solid #eee",
                                  background: color,
                                }}
                              >
                                {pct !== undefined ? `${pct}%` : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p style={{ color: "#999", fontSize: 12, marginTop: 16, textAlign: "center" }}>
              Métricas: cache 60s · Cohorts: cache 5min. Refresh manual: botão acima.
            </p>
          </>
        ) : null}
      </div>
    </>
  );
};

(MetricsPage as any).authRoles = ["ADMIN", "COWORKING"];
(MetricsPage as any).getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);

export default MetricsPage;
