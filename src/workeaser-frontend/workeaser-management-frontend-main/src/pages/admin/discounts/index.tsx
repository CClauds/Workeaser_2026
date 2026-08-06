/**
 * /admin/discounts — gerenciar cupons de desconto.
 * Sprint J (HF-SPRINT-J-05).
 *
 * Capacidades:
 *  - Listar cupons (active/inactive filter)
 *  - Criar novo cupom (percent ou fixed) com max_per_user, max_redemptions, valid_until
 *  - Desativar
 *  - Ver redemptions count (atual/limite)
 */
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { toast } from "react-toastify";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface DiscountRow {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  currency: string | null;
  max_redemptions: number | null;
  max_per_user: number;
  current_redemptions: number;
  active: boolean;
  valid_until: string | null;
  created_at: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return { redirect: { destination: "/login?expired=true", permanent: false } };
  }
  return { props: {} };
};

const AdminDiscountsPage = () => {
  const [items, setItems] = useState<DiscountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "true" | "false">("all");

  // Form state pra create
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"percent" | "fixed">("percent");
  const [formValue, setFormValue] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formMaxRedemptions, setFormMaxRedemptions] = useState("");
  const [formMaxPerUser, setFormMaxPerUser] = useState("1");
  const [formValidUntil, setFormValidUntil] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const params: Record<string, string> = { per_page: "50" };
      if (filterActive !== "all") params.active = filterActive;
      const qs = new URLSearchParams(params).toString();
      const { data } = await api.get(`/admin/discounts?${qs}`);
      setItems(data?.result || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao carregar cupons");
    } finally {
      setLoading(false);
    }
  }, [filterActive]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = async () => {
    if (!formCode.trim() || !formValue.trim()) {
      toast.warn("Código e valor obrigatórios");
      return;
    }
    setBusy("create");
    try {
      const api = getAPIClient();
      const body: any = {
        code: formCode.trim().toUpperCase(),
        description: formDescription || undefined,
        discount_type: formType,
        discount_value: Number(formValue),
        max_per_user: Number(formMaxPerUser) || 1,
      };
      if (formType === "fixed") body.currency = formCurrency;
      if (formMaxRedemptions) body.max_redemptions = Number(formMaxRedemptions);
      if (formValidUntil) body.valid_until = new Date(formValidUntil).toISOString();
      await api.post("/admin/discounts", body);
      toast.success("Cupom criado!");
      setShowCreate(false);
      setFormCode("");
      setFormDescription("");
      setFormValue("");
      setFormMaxRedemptions("");
      setFormMaxPerUser("1");
      setFormValidUntil("");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao criar cupom");
    } finally {
      setBusy(null);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Desativar este cupom? Não poderá mais ser usado.")) return;
    setBusy(`deactivate-${id}`);
    try {
      const api = getAPIClient();
      await api.post(`/admin/discounts/${id}/deactivate`);
      toast.success("Cupom desativado");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao desativar");
    } finally {
      setBusy(null);
    }
  };

  const formatValue = (row: DiscountRow) => {
    if (row.discount_type === "percent") return `${row.discount_value}%`;
    return `${row.currency || "USD"} ${(row.discount_value / 100).toFixed(2)}`;
  };

  return (
    <>
      <Head>
        <title>Cupons | Workeaser Admin</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Cupons de desconto</h1>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            style={{
              background: "#1677ff",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            + Novo cupom
          </button>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ color: "#666", fontSize: 14 }}>Filtrar:</label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            style={{ padding: "6px 12px", border: "1px solid #d9d9d9", borderRadius: 4 }}
          >
            <option value="all">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={th}>Código</th>
                  <th style={th}>Desconto</th>
                  <th style={th}>Resgates</th>
                  <th style={th}>Limite p/ user</th>
                  <th style={th}>Status</th>
                  <th style={th}>Vence em</th>
                  <th style={th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const expired = row.valid_until && new Date(row.valid_until) < new Date();
                  return (
                    <tr key={row.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ ...td, fontFamily: "monospace", fontWeight: 600 }}>{row.code}</td>
                      <td style={td}>
                        <strong>{formatValue(row)}</strong>
                        {row.description && (
                          <div style={{ fontSize: 11, color: "#999" }}>{row.description}</div>
                        )}
                      </td>
                      <td style={td}>
                        {row.current_redemptions}
                        {row.max_redemptions !== null && ` / ${row.max_redemptions}`}
                      </td>
                      <td style={td}>{row.max_per_user}x</td>
                      <td style={td}>
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: row.active && !expired ? "#f6ffed" : "#fff1f0",
                            color: row.active && !expired ? "#389e0d" : "#cf1322",
                          }}
                        >
                          {!row.active ? "Inativo" : expired ? "Expirado" : "Ativo"}
                        </span>
                      </td>
                      <td style={td}>
                        {row.valid_until ? new Date(row.valid_until).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td style={td}>
                        {row.active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(row.id)}
                            disabled={busy === `deactivate-${row.id}`}
                            style={{
                              background: "transparent",
                              color: "#cf1322",
                              border: "1px solid #cf1322",
                              padding: "4px 12px",
                              borderRadius: 4,
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Desativar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...td, textAlign: "center", color: "#999", padding: 32 }}>
                      Nenhum cupom criado ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Criar cupom */}
        {showCreate && (
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
            onClick={() => setShowCreate(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                maxWidth: 560,
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Novo cupom</h3>

              <FormField label="Código (A-Z, 0-9, _, -)">
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="ABRIL30"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Descrição (interna)">
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Campanha de Abril"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Tipo de desconto">
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as "percent" | "fixed")}
                  style={inputStyle}
                >
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Valor fixo (cents)</option>
                </select>
              </FormField>

              <FormField
                label={
                  formType === "percent"
                    ? "Valor (1-100, ex: 30 = 30%)"
                    : "Valor em centavos (ex: 1000 = $10.00)"
                }
              >
                <input
                  type="number"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  style={inputStyle}
                />
              </FormField>

              {formType === "fixed" && (
                <FormField label="Moeda">
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="USD">USD</option>
                    <option value="BRL">BRL</option>
                    <option value="EUR">EUR</option>
                  </select>
                </FormField>
              )}

              <FormField label="Resgates máximos globais (deixe vazio = ilimitado)">
                <input
                  type="number"
                  value={formMaxRedemptions}
                  onChange={(e) => setFormMaxRedemptions(e.target.value)}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Máximo por usuário">
                <input
                  type="number"
                  value={formMaxPerUser}
                  onChange={(e) => setFormMaxPerUser(e.target.value)}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Vence em (opcional)">
                <input
                  type="datetime-local"
                  value={formValidUntil}
                  onChange={(e) => setFormValidUntil(e.target.value)}
                  style={inputStyle}
                />
              </FormField>

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={busy === "create"}
                  style={{
                    background: "#1677ff",
                    color: "#fff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: 4,
                    cursor: busy === "create" ? "not-allowed" : "pointer",
                  }}
                >
                  {busy === "create" ? "Criando..." : "Criar cupom"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d9d9d9",
  borderRadius: 4,
  fontSize: 14,
};
const th: React.CSSProperties = { padding: 12, textAlign: "left", fontWeight: 600 };
const td: React.CSSProperties = { padding: 12 };

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

(AdminDiscountsPage as any).authRoles = ["ADMIN", "COWORKING"];
(AdminDiscountsPage as any).getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);

export default AdminDiscountsPage;
