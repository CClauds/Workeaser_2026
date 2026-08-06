/**
 * /admin/webhook-dlq — Dead Letter Queue de webhooks falhados.
 * Sprint J (HF-SPRINT-J-06).
 *
 * Visualiza eventos webhook que falharam handler. Admin pode:
 *  - Ver detalhes do payload + último erro
 *  - Forçar retry imediato
 *  - Descartar (marca failed manualmente)
 */
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface DLQItem {
  id: number;
  provider: string;
  event_type: string;
  event_id: string | null;
  status: "pending" | "processing" | "resolved" | "failed";
  attempts: number;
  max_attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
  resolved_at: string | null;
  created_at: string;
  payload: string;
}

interface DLQItemDetail extends DLQItem {
  payload_parsed: unknown;
}

interface Stats {
  period_days: number;
  total_events: number;
  by_status: Array<{ status: string; count: number }>;
  by_provider: Array<{ provider: string; count: number }>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return { redirect: { destination: "/login?expired=true", permanent: false } };
  }
  return { props: {} };
};

const statusColor: Record<string, string> = {
  pending: "#fa8c16",
  processing: "#1677ff",
  resolved: "#52c41a",
  failed: "#ff4d4f",
};

const AdminDLQPage = () => {
  const [items, setItems] = useState<DLQItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DLQItemDetail | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProvider, setFilterProvider] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const params: Record<string, string> = { per_page: "50" };
      if (filterStatus) params.status = filterStatus;
      if (filterProvider) params.provider = filterProvider;
      const qs = new URLSearchParams(params).toString();
      const [itemsRes, statsRes] = await Promise.all([
        api.get(`/admin/webhook-dlq?${qs}`),
        api.get("/admin/webhook-dlq/stats?days=7").catch(() => ({ data: { result: null } })),
      ]);
      setItems(itemsRes.data?.result || []);
      setStats(statsRes.data?.result || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao carregar DLQ");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterProvider]);

  useEffect(() => {
    reload();
  }, [reload]);

  const openDetail = async (id: number) => {
    try {
      const api = getAPIClient();
      const { data } = await api.get(`/admin/webhook-dlq/${id}`);
      setDetail(data?.result);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao carregar detalhe");
    }
  };

  const handleRetry = async (id: number) => {
    setBusy(`retry-${id}`);
    try {
      const api = getAPIClient();
      const { data } = await api.post(`/admin/webhook-dlq/${id}/retry`);
      toast.success(data?.result?.message || "Reprocessamento OK");
      setDetail(null);
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Retry falhou");
    } finally {
      setBusy(null);
    }
  };

  const handleDiscard = async (id: number) => {
    if (!confirm("Descartar este evento? Ele NÃO será reprocessado automaticamente.")) return;
    setBusy(`discard-${id}`);
    try {
      const api = getAPIClient();
      await api.post(`/admin/webhook-dlq/${id}/discard`);
      toast.success("Descartado");
      setDetail(null);
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao descartar");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Head>
        <title>Webhook DLQ | Workeaser Admin</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        <h1>Webhook Dead Letter Queue</h1>
        <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
          Eventos webhook que falharam ao processar. Worker reprocessa automaticamente com backoff
          exponencial (5min→16d, max 10 tentativas). Use "Retry agora" pra forçar processamento
          imediato.
        </p>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={statCard}>
              <div style={statLabel}>Total 7d</div>
              <div style={statValue}>{stats.total_events}</div>
            </div>
            {stats.by_status.map((s) => (
              <div key={s.status} style={statCard}>
                <div style={statLabel}>{s.status}</div>
                <div style={{ ...statValue, color: statusColor[s.status] || "#222" }}>{s.count}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "6px 12px", border: "1px solid #d9d9d9", borderRadius: 4 }}
          >
            <option value="">Todos status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="resolved">Resolved</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            style={{ padding: "6px 12px", border: "1px solid #d9d9d9", borderRadius: 4 }}
          >
            <option value="">Todos providers</option>
            <option value="stripe">Stripe</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="ses">SES</option>
            <option value="docusign">DocuSign</option>
            <option value="boldsign">BoldSign</option>
          </select>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={th}>ID</th>
                  <th style={th}>Quando</th>
                  <th style={th}>Provider</th>
                  <th style={th}>Event</th>
                  <th style={th}>Status</th>
                  <th style={th}>Tentativas</th>
                  <th style={th}>Próxima</th>
                  <th style={th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={td}>{it.id}</td>
                    <td style={td}>
                      {new Date(it.created_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td style={{ ...td, fontWeight: 600 }}>{it.provider}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: 11 }}>
                      {it.event_type}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          background: statusColor[it.status] + "22",
                          color: statusColor[it.status],
                          padding: "2px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {it.status}
                      </span>
                    </td>
                    <td style={td}>
                      {it.attempts}/{it.max_attempts}
                    </td>
                    <td style={td}>
                      {it.next_attempt_at
                        ? new Date(it.next_attempt_at).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td style={td}>
                      <button
                        type="button"
                        onClick={() => openDetail(it.id)}
                        style={btnSecondary}
                      >
                        Detalhes
                      </button>
                      {it.status !== "resolved" && (
                        <button
                          type="button"
                          onClick={() => handleRetry(it.id)}
                          disabled={busy === `retry-${it.id}`}
                          style={{ ...btnPrimary, marginLeft: 4 }}
                        >
                          ↻
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...td, textAlign: "center", color: "#999", padding: 32 }}>
                      Nenhum evento na DLQ. Tudo processando OK 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail modal */}
        {detail && (
          <div
            role="dialog"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9000,
            }}
            onClick={() => setDetail(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                maxWidth: 720,
                width: "92%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>
                  Evento #{detail.id} — {detail.provider}
                </h3>
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ marginTop: 16, fontSize: 13, color: "#666" }}>
                <div>
                  <strong>Tipo:</strong> {detail.event_type}
                </div>
                <div>
                  <strong>Event ID:</strong>{" "}
                  <code style={{ fontSize: 11 }}>{detail.event_id || "—"}</code>
                </div>
                <div>
                  <strong>Status:</strong> {detail.status} ({detail.attempts}/{detail.max_attempts}{" "}
                  tentativas)
                </div>
                {detail.resolved_at && (
                  <div>
                    <strong>Resolvido em:</strong>{" "}
                    {new Date(detail.resolved_at).toLocaleString("pt-BR")}
                  </div>
                )}
              </div>

              {detail.last_error && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "#fff1f0",
                    border: "1px solid #ffa39e",
                    borderRadius: 4,
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#cf1322", marginBottom: 4 }}>
                    Último erro:
                  </div>
                  <code style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{detail.last_error}</code>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Payload:</div>
                <pre
                  style={{
                    background: "#fafafa",
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 11,
                    overflowX: "auto",
                    maxHeight: 280,
                    border: "1px solid #eee",
                  }}
                >
                  {JSON.stringify(detail.payload_parsed || detail.payload, null, 2)}
                </pre>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                {detail.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() => handleRetry(detail.id)}
                    disabled={busy === `retry-${detail.id}`}
                    style={btnPrimary}
                  >
                    {busy === `retry-${detail.id}` ? "Reprocessando..." : "↻ Retry agora"}
                  </button>
                )}
                {detail.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleDiscard(detail.id)}
                    disabled={busy === `discard-${detail.id}`}
                    style={{
                      background: "transparent",
                      color: "#cf1322",
                      border: "1px solid #cf1322",
                      padding: "8px 20px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Descartar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const statCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: 8,
  padding: 14,
  flex: "1 1 140px",
};
const statLabel: React.CSSProperties = {
  fontSize: 11,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
const statValue: React.CSSProperties = { fontSize: 24, fontWeight: 700, marginTop: 4 };
const th: React.CSSProperties = { padding: 10, textAlign: "left", fontWeight: 600 };
const td: React.CSSProperties = { padding: 10 };
const btnPrimary: React.CSSProperties = {
  background: "#1677ff",
  color: "#fff",
  border: "none",
  padding: "6px 14px",
  borderRadius: 4,
  fontSize: 12,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  background: "transparent",
  color: "#1677ff",
  border: "1px solid #1677ff",
  padding: "6px 14px",
  borderRadius: 4,
  fontSize: 12,
  cursor: "pointer",
};

(AdminDLQPage as any).authRoles = ["ADMIN", "COWORKING"];
(AdminDLQPage as any).getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);

export default AdminDLQPage;
