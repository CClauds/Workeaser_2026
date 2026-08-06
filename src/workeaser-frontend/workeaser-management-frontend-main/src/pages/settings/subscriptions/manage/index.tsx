/**
 * /settings/subscriptions/manage — gerencia assinatura ativa.
 * Sprint F (HF-SPRINT-F-03 + HF-SPRINT-F-06).
 *
 * Capacidades:
 *  - Mostrar status da subscription atual (plan, status, current_period_end)
 *  - Botão "Gerenciar pagamento" → abre Stripe Customer Portal (managed pelo Stripe)
 *  - Botão "Mudar plano" → modal seleciona novo plano + escolha de proration
 *  - Botão "Cancelar" → confirma + cancela ao fim do período
 *  - Botão "Sincronizar" → force sync com Stripe (recovery)
 */
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface PlanSummary {
  id: number;
  code: string;
  name: string;
  amount_cents: number;
  currency: string;
  interval: string;
}

interface SubscriptionView {
  id: number;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  trial_end: string | null;
  plan: PlanSummary | null;
}

const formatMoney = (cents: number, currency: string) => {
  const v = (cents || 0) / 100;
  if (currency === "BRL") return `R$ ${v.toFixed(2).replace(".", ",")}`;
  return `${currency} ${v.toFixed(2)}`;
};

const statusColor: Record<string, string> = {
  active: "#52c41a",
  trialing: "#1677ff",
  past_due: "#fa8c16",
  canceled: "#ff4d4f",
  unpaid: "#ff4d4f",
  incomplete: "#999",
  incomplete_expired: "#999",
};

const ManageSubscriptionPage = () => {
  const [subs, setSubs] = useState<SubscriptionView[]>([]);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [changePlanOpenFor, setChangePlanOpenFor] = useState<number | null>(null);
  const [newPlanId, setNewPlanId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const [subsRes, plansRes] = await Promise.all([
        api.get("/cowork/subscriptions"),
        api.get("/cowork/subscriptions/plans"),
      ]);
      setSubs(subsRes.data?.result || []);
      setPlans(plansRes.data?.result || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const openPortal = async () => {
    setBusy("portal");
    try {
      const api = getAPIClient();
      const { data } = await api.post("/cowork/subscriptions/portal-session", {
        return_url: "/settings/subscriptions/manage",
      });
      const url = data?.result?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Stripe não devolveu URL do portal");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao abrir portal");
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async (subId: number) => {
    if (!confirm("Cancelar assinatura ao fim do período atual? Você poderá usar até o vencimento."))
      return;
    setBusy(`cancel-${subId}`);
    try {
      const api = getAPIClient();
      await api.post(`/cowork/subscriptions/${subId}/cancel`, { at_period_end: true });
      toast.success("Cancelamento agendado para o fim do período");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao cancelar");
    } finally {
      setBusy(null);
    }
  };

  // HF-SPRINT-J-02: self-service trial extension
  const handleExtendTrial = async (subId: number) => {
    if (
      !confirm(
        "Estender seu trial por +7 dias gratuitamente? (1 extensão self-service por assinatura)"
      )
    ) {
      return;
    }
    setBusy(`extend-${subId}`);
    try {
      const api = getAPIClient();
      const { data } = await api.post(`/cowork/subscriptions/${subId}/extend-trial-self-service`);
      const result = data?.result;
      toast.success(result?.message || "Trial estendido por +7 dias!");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao estender trial");
    } finally {
      setBusy(null);
    }
  };

  const handleSync = async (subId: number) => {
    setBusy(`sync-${subId}`);
    try {
      const api = getAPIClient();
      await api.post(`/cowork/subscriptions/${subId}/sync`);
      toast.success("Sincronizado com Stripe");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao sincronizar");
    } finally {
      setBusy(null);
    }
  };

  const handleChangePlan = async () => {
    if (!changePlanOpenFor || !newPlanId) {
      toast.warn("Selecione um plano");
      return;
    }
    setBusy(`change-${changePlanOpenFor}`);
    try {
      const api = getAPIClient();
      await api.post(`/cowork/subscriptions/${changePlanOpenFor}/change-plan`, {
        new_plan_id: newPlanId,
        proration_behavior: "create_prorations",
      });
      toast.success(
        "Plano alterado! Diferença pro-rata será refletida na próxima fatura."
      );
      setChangePlanOpenFor(null);
      setNewPlanId(null);
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao mudar plano");
    } finally {
      setBusy(null);
    }
  };

  const activeSub = subs.find((s) => s.status === "active" || s.status === "trialing");

  return (
    <>
      <Head>
        <title>Gerenciar assinatura | Workeaser</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1>Minha assinatura</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : subs.length === 0 ? (
          <div style={{ background: "#fafafa", padding: 24, borderRadius: 8 }}>
            <p>Você ainda não tem assinatura ativa.</p>
            <a
              href="/settings/subscriptions/upgrade"
              style={{
                display: "inline-block",
                background: "#1677ff",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              Escolher um plano
            </a>
          </div>
        ) : (
          <>
            {subs.map((s) => (
              <div
                key={s.id}
                style={{
                  border: "1px solid #e8e8e8",
                  borderRadius: 8,
                  padding: 24,
                  marginBottom: 16,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h3 style={{ marginTop: 0 }}>
                    {s.plan?.name || "(plano desconhecido)"}{" "}
                    <span
                      style={{
                        background: statusColor[s.status] || "#999",
                        color: "#fff",
                        padding: "2px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        marginLeft: 8,
                        verticalAlign: "middle",
                      }}
                    >
                      {s.status}
                    </span>
                  </h3>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {s.plan ? formatMoney(s.plan.amount_cents, s.plan.currency) : "-"}
                    <span style={{ fontSize: 12, fontWeight: 400, color: "#666" }}>
                      /{s.plan?.interval === "yearly" ? "ano" : "mês"}
                    </span>
                  </div>
                </div>

                <div style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
                  {s.current_period_end && (
                    <div>
                      Próxima cobrança:{" "}
                      <strong>{new Date(s.current_period_end).toLocaleDateString("pt-BR")}</strong>
                    </div>
                  )}
                  {s.cancel_at && (
                    <div style={{ color: "#cf1322" }}>
                      Cancelamento agendado para:{" "}
                      <strong>{new Date(s.cancel_at).toLocaleDateString("pt-BR")}</strong>
                    </div>
                  )}
                  {s.trial_end && new Date(s.trial_end) > new Date() && (
                    <div style={{ color: "#1677ff" }}>
                      Trial até: <strong>{new Date(s.trial_end).toLocaleDateString("pt-BR")}</strong>
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setChangePlanOpenFor(s.id)}
                    disabled={busy === `change-${s.id}`}
                    style={{
                      background: "#1677ff",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Mudar plano
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSync(s.id)}
                    disabled={busy === `sync-${s.id}`}
                    style={{
                      background: "transparent",
                      color: "#1677ff",
                      border: "1px solid #1677ff",
                      padding: "8px 16px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    {busy === `sync-${s.id}` ? "Sincronizando..." : "↻ Sincronizar"}
                  </button>
                  {/* HF-SPRINT-J-02: Self-service trial extension (só em status=trialing) */}
                  {s.status === "trialing" && (
                    <button
                      type="button"
                      onClick={() => handleExtendTrial(s.id)}
                      disabled={busy === `extend-${s.id}`}
                      style={{
                        background: "#52c41a",
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      {busy === `extend-${s.id}` ? "Estendendo..." : "🎁 +7 dias grátis"}
                    </button>
                  )}
                  {!s.cancel_at && (s.status === "active" || s.status === "trialing") && (
                    <button
                      type="button"
                      onClick={() => handleCancel(s.id)}
                      disabled={busy === `cancel-${s.id}`}
                      style={{
                        background: "transparent",
                        color: "#cf1322",
                        border: "1px solid #cf1322",
                        padding: "8px 16px",
                        borderRadius: 4,
                        cursor: "pointer",
                        marginLeft: "auto",
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Botão Customer Portal — só faz sentido se tem subscription ativa */}
            {activeSub && (
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #e8e8e8",
                  padding: 20,
                  borderRadius: 8,
                  marginTop: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h4 style={{ margin: 0 }}>Painel de pagamentos (Stripe)</h4>
                  <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
                    Gerencie cartões salvos, baixe invoices anteriores, atualize dados de cobrança.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPortal}
                  disabled={busy === "portal"}
                  style={{
                    background: "#1677ff",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 4,
                    cursor: busy === "portal" ? "not-allowed" : "pointer",
                  }}
                >
                  {busy === "portal" ? "Abrindo..." : "Abrir portal Stripe →"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal: mudar plano */}
        {changePlanOpenFor && (
          <div
            role="dialog"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9000,
            }}
            onClick={() => setChangePlanOpenFor(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                maxWidth: 480,
                width: "90%",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Mudar para qual plano?</h3>
              <p style={{ color: "#666", fontSize: 14 }}>
                A diferença pro-rata será creditada (downgrade) ou cobrada (upgrade) na próxima
                fatura.
              </p>
              {plans.map((p) => (
                <label
                  key={p.id}
                  style={{
                    display: "block",
                    padding: 12,
                    marginBottom: 8,
                    border: newPlanId === p.id ? "2px solid #1677ff" : "1px solid #d9d9d9",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    checked={newPlanId === p.id}
                    onChange={() => setNewPlanId(p.id)}
                    style={{ marginRight: 8 }}
                  />
                  <strong>{p.name}</strong> ({p.code}) —{" "}
                  {formatMoney(p.amount_cents, p.currency)}/{p.interval === "yearly" ? "ano" : "mês"}
                </label>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={handleChangePlan}
                  disabled={!newPlanId || busy === `change-${changePlanOpenFor}`}
                  style={{
                    background: "#1677ff",
                    color: "#fff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: 4,
                    cursor: !newPlanId ? "not-allowed" : "pointer",
                    opacity: !newPlanId ? 0.6 : 1,
                  }}
                >
                  {busy === `change-${changePlanOpenFor}` ? "Aplicando..." : "Confirmar mudança"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangePlanOpenFor(null);
                    setNewPlanId(null);
                  }}
                  style={{
                    background: "transparent",
                    color: "#666",
                    border: "1px solid #d9d9d9",
                    padding: "10px 24px",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

(ManageSubscriptionPage as any).authRoles = ["COWORKING"];
(ManageSubscriptionPage as any).getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <SettingsLayout>{page}</SettingsLayout>
  </CoworkingLayout>
);

export default ManageSubscriptionPage;
