/**
 * /admin/audit-logs — Viewer da tabela `logs`.
 * Sprint G (HF-SPRINT-G-06).
 *
 * Filtros: module, action, user_id, from, to.
 * Paginação 50 por página.
 * Stats: total, login_failures, by_module, top_users (último 7d).
 */
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface LogRow {
  id: number;
  user_id: number | null;
  user_email: string | null;
  module: string;
  action: string;
  identifier: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Pagination {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface Stats {
  period_days: number;
  total_events: number;
  login_failures: number;
  by_module: Array<{ module: string; count: number }>;
  by_action: Array<{ module: string; action: string; count: number }>;
  top_users: Array<{ user_id: number; email: string; count: number }>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return { redirect: { destination: "/login?expired=true", permanent: false } };
  }
  return { props: {} };
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const params: Record<string, string> = { page: String(p), per_page: "50" };
      if (moduleFilter) params.module = moduleFilter;
      if (actionFilter) params.action = actionFilter;
      if (userIdFilter) params.user_id = userIdFilter;
      const qs = new URLSearchParams(params).toString();
      const { data } = await api.get(`/admin/audit-logs?${qs}`);
      setLogs(data?.result || []);
      setPagination(data?.pagination || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao carregar logs");
    } finally {
      setLoading(false);
    }
  }, [moduleFilter, actionFilter, userIdFilter]);

  const loadStats = useCallback(async () => {
    try {
      const api = getAPIClient();
      const { data } = await api.get("/admin/audit-logs/stats?days=7");
      setStats(data?.result);
    } catch (err) {
      // stats falha não bloqueia
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadLogs(1);
    setPage(1);
  }, [loadLogs, loadStats]);

  const applyFilters = () => {
    setPage(1);
    loadLogs(1);
  };

  const clearFilters = () => {
    setModuleFilter("");
    setActionFilter("");
    setUserIdFilter("");
    setPage(1);
    setTimeout(() => loadLogs(1), 0);
  };

  return (
    <>
      <Head>
        <title>Audit Logs | Workeaser Admin</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        <h1>Audit Logs</h1>

        {/* Stats summary */}
        {stats && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Eventos (7d)</div>
              <div style={statValueStyle}>{stats.total_events}</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Login failures (7d)</div>
              <div style={{ ...statValueStyle, color: stats.login_failures > 50 ? "#ff4d4f" : "#222" }}>
                {stats.login_failures}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Top módulo</div>
              <div style={statValueStyle}>{stats.by_module[0]?.module || "-"}</div>
              <div style={{ fontSize: 12, color: "#999" }}>{stats.by_module[0]?.count || 0} eventos</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Usuário mais ativo</div>
              <div style={{ ...statValueStyle, fontSize: 14 }}>{stats.top_users[0]?.email || "-"}</div>
              <div style={{ fontSize: 12, color: "#999" }}>{stats.top_users[0]?.count || 0} eventos</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            background: "#fafafa",
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Módulo (ex: AUTH, INVOICE)"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Ação (ex: LOGIN_SUCCESS, CREATE)"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="User ID"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            style={{ ...inputStyle, width: 120 }}
          />
          <button onClick={applyFilters} style={btnPrimaryStyle}>
            Filtrar
          </button>
          <button onClick={clearFilters} style={btnSecondaryStyle}>
            Limpar
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            <div style={{ overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e8e8e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Quando</th>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Módulo</th>
                    <th style={thStyle}>Ação</th>
                    <th style={thStyle}>Ref ID</th>
                    <th style={thStyle}>Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={tdStyle}>{l.id}</td>
                      <td style={tdStyle}>
                        {new Date(l.created_at).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td style={tdStyle}>
                        {l.user_email || `#${l.user_id || "?"}`}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{l.module}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: l.action.includes("FAILURE")
                              ? "#fff1f0"
                              : l.action.includes("CREATE") || l.action.includes("SUCCESS")
                              ? "#f6ffed"
                              : "#f0f5ff",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                          }}
                        >
                          {l.action}
                        </span>
                      </td>
                      <td style={tdStyle}>{l.identifier ?? "-"}</td>
                      <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 11, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.metadata ? JSON.stringify(l.metadata) : "-"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: "#999", padding: 32 }}>
                        Nenhum log encontrado pra esses filtros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.lastPage > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <span style={{ color: "#666", fontSize: 13 }}>
                  Página {pagination.page} de {pagination.lastPage} · {pagination.total} eventos
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      const np = Math.max(1, page - 1);
                      setPage(np);
                      loadLogs(np);
                    }}
                    disabled={page <= 1}
                    style={btnSecondaryStyle}
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => {
                      const np = Math.min(pagination.lastPage, page + 1);
                      setPage(np);
                      loadLogs(np);
                    }}
                    disabled={page >= pagination.lastPage}
                    style={btnSecondaryStyle}
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const statCardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: 8,
  padding: 16,
  flex: "1 1 180px",
};
const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
const statValueStyle: React.CSSProperties = { fontSize: 24, fontWeight: 700, marginTop: 4 };
const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d9d9d9",
  borderRadius: 4,
  fontSize: 14,
};
const btnPrimaryStyle: React.CSSProperties = {
  background: "#1677ff",
  color: "#fff",
  border: "none",
  padding: "8px 20px",
  borderRadius: 4,
  cursor: "pointer",
};
const btnSecondaryStyle: React.CSSProperties = {
  background: "transparent",
  color: "#666",
  border: "1px solid #d9d9d9",
  padding: "8px 20px",
  borderRadius: 4,
  cursor: "pointer",
};
const thStyle: React.CSSProperties = { padding: 10, textAlign: "left", fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: 10 };

(AuditLogsPage as any).authRoles = ["ADMIN", "COWORKING"];
(AuditLogsPage as any).getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);

export default AuditLogsPage;
