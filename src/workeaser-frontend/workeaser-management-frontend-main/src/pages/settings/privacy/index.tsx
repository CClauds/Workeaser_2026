/**
 * /settings/privacy — gestão de privacidade LGPD.
 * Sprint D (HF-SPRINT-D-11).
 *
 * - Botão "Exportar meus dados" → GET /api/me/export-data (download JSON)
 * - Botão "Excluir minha conta" → POST /api/me/delete-account (janela 7 dias)
 * - Lista pedidos pendentes + permite cancelar dentro da janela
 */
import React, { ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface DeletionRequest {
  id: number;
  status: string;
  requested_at: string;
  scheduled_execution_at: string | null;
  completed_at: string | null;
  rejection_reason: string | null;
  days_until_execution: number;
}

const PrivacyPage = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const { data } = await api.get("/me/delete-account");
      setRequests(data?.result || []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message ||
          "Falha ao carregar pedidos. Tente novamente em alguns segundos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const api = getAPIClient();
      const res = await api.get("/me/export-data", { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workeaser-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      toast.success("Download iniciado");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao exportar");
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000);
      return;
    }
    try {
      const api = getAPIClient();
      const { data } = await api.post("/me/delete-account", { reason: reason || undefined });
      toast.success(data?.result?.message || "Pedido criado. Você pode cancelar dentro da janela.");
      setReason("");
      setConfirming(false);
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao criar pedido");
    }
  };

  const handleCancel = async (id: number) => {
    try {
      const api = getAPIClient();
      await api.delete(`/me/delete-account/${id}`);
      toast.success("Pedido cancelado");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao cancelar");
    }
  };

  const activePending = requests.find((r) => r.status === "requested");

  return (
    <>
      <Head>
        <title>Privacidade | Workeaser</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1>Privacidade & LGPD</h1>
        <p style={{ color: "#666", marginBottom: 32 }}>
          Seus direitos como titular dos dados (Lei 13.709/2018 — LGPD).
        </p>

        {/* Export */}
        <section
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3 style={{ marginTop: 0 }}>📥 Baixar meus dados</h3>
          <p style={{ color: "#666" }}>
            Receba um arquivo JSON com todas as informações que temos sobre você (cadastro, faturas,
            pagamentos, contratos, reservas).
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            style={{
              background: "#1677ff",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: 4,
              cursor: exporting ? "not-allowed" : "pointer",
              opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting ? "Preparando download..." : "Baixar JSON"}
          </button>
        </section>

        {/* Delete account */}
        <section
          style={{
            border: "1px solid #ff7875",
            borderRadius: 8,
            padding: 24,
            background: "#fff1f0",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#cf1322" }}>🗑️ Excluir minha conta</h3>
          {activePending ? (
            <>
              <p>
                <strong>Pedido em andamento</strong> (id #{activePending.id}). Sua conta será
                anonimizada em <strong>{activePending.days_until_execution} dia(s)</strong>.
              </p>
              <button
                type="button"
                onClick={() => handleCancel(activePending.id)}
                style={{
                  background: "#fff",
                  color: "#1677ff",
                  border: "1px solid #1677ff",
                  padding: "10px 24px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancelar pedido e manter conta
              </button>
            </>
          ) : (
            <>
              <p style={{ color: "#666" }}>
                Sua conta será marcada para exclusão. Dados pessoais (nome, email, telefone) serão
                anonimizados em 7 dias. Você pode cancelar a qualquer momento durante esse período.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo (opcional): por que está saindo? Nos ajuda a melhorar."
                rows={3}
                maxLength={1000}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #d9d9d9",
                  marginBottom: 12,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={handleRequestDelete}
                style={{
                  background: confirming ? "#cf1322" : "#fff",
                  color: confirming ? "#fff" : "#cf1322",
                  border: "1px solid #cf1322",
                  padding: "10px 24px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {confirming
                  ? "Clique novamente para CONFIRMAR exclusão (irreversível após 7 dias)"
                  : "Solicitar exclusão da conta"}
              </button>
            </>
          )}
        </section>

        {/* Histórico */}
        {requests.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h3>Histórico de pedidos</h3>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={{ padding: 8, textAlign: "left", border: "1px solid #eee" }}>#</th>
                    <th style={{ padding: 8, textAlign: "left", border: "1px solid #eee" }}>
                      Status
                    </th>
                    <th style={{ padding: 8, textAlign: "left", border: "1px solid #eee" }}>
                      Solicitado em
                    </th>
                    <th style={{ padding: 8, textAlign: "left", border: "1px solid #eee" }}>
                      Execução
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>{r.id}</td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>{r.status}</td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {new Date(r.requested_at).toLocaleString("pt-BR")}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {r.completed_at
                          ? new Date(r.completed_at).toLocaleString("pt-BR")
                          : r.scheduled_execution_at
                          ? new Date(r.scheduled_execution_at).toLocaleString("pt-BR")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </div>
    </>
  );
};

PrivacyPage.authRoles = ["COWORKING", "CLIENT"];
PrivacyPage.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <SettingsLayout>{page}</SettingsLayout>
  </CoworkingLayout>
);

export default PrivacyPage;
