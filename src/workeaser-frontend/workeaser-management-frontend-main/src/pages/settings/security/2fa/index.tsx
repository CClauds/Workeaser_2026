/**
 * /settings/security/2fa — gestão de 2FA TOTP.
 * Sprint D (HF-SPRINT-D-12).
 *
 * Fluxo:
 *  1. GET /api/me/2fa → status
 *  2. Se desativado: POST /api/me/2fa/setup → exibe QR code (gerado client-side a partir do otpauth_uri)
 *  3. Usuário escaneia no app + digita código de 6 dígitos
 *  4. POST /api/me/2fa/verify → ativa + recebe 10 backup codes (mostra 1 vez)
 *  5. POST /api/me/2fa/disable (com código) → desativa
 *
 * QR code: usa API pública QRserver.com (sem dependência local). Pode trocar
 * por lib React (`qrcode.react`) numa próxima iteração.
 */
import React, { ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { getAPIClient } from "@services/apiClient";
import { PagesProps } from "pages/_app";

interface TwoFaStatus {
  enabled: boolean;
  enabled_at: string | null;
  has_pending_setup: boolean;
}

const TwoFaPage = () => {
  const [status, setStatus] = useState<TwoFaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [working, setWorking] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const { data } = await api.get("/me/2fa");
      setStatus(data?.result);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao carregar status 2FA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleStartSetup = async () => {
    setWorking(true);
    try {
      const api = getAPIClient();
      const { data } = await api.post("/me/2fa/setup");
      setSetupData(data?.result);
      setBackupCodes(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Falha ao iniciar setup 2FA");
    } finally {
      setWorking(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code.replace(/\s/g, ""))) {
      toast.warn("Código deve ter 6 dígitos");
      return;
    }
    setWorking(true);
    try {
      const api = getAPIClient();
      const { data } = await api.post("/me/2fa/verify", { code });
      setBackupCodes(data?.result?.backup_codes || []);
      setSetupData(null);
      setCode("");
      toast.success("2FA ativado!");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Código inválido");
    } finally {
      setWorking(false);
    }
  };

  const handleDisable = async () => {
    if (!/^[\d\w-]{6,16}$/.test(code.replace(/\s/g, ""))) {
      toast.warn("Informe código TOTP de 6 dígitos OU backup code");
      return;
    }
    if (!confirm("Tem certeza que deseja desativar o 2FA? Sua conta ficará menos segura.")) return;
    setWorking(true);
    try {
      const api = getAPIClient();
      await api.post("/me/2fa/disable", { code });
      toast.success("2FA desativado");
      setCode("");
      setBackupCodes(null);
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Código inválido");
    } finally {
      setWorking(false);
    }
  };

  const qrUrl = setupData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        setupData.uri
      )}`
    : null;

  return (
    <>
      <Head>
        <title>Autenticação de dois fatores | Workeaser</title>
      </Head>
      <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h1>Autenticação em dois fatores (2FA)</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Camada extra de proteção: além da senha, login exige código de 6 dígitos do seu app
          autenticador (Google Authenticator, Authy, 1Password).
        </p>

        {loading ? (
          <p>Carregando...</p>
        ) : status?.enabled ? (
          <div
            style={{ background: "#f6ffed", padding: 24, borderRadius: 8, border: "1px solid #b7eb8f" }}
          >
            <h3 style={{ marginTop: 0, color: "#389e0d" }}>✓ 2FA ativado</h3>
            <p>
              Ativado em:{" "}
              {status.enabled_at ? new Date(status.enabled_at).toLocaleString("pt-BR") : "-"}
            </p>
            <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #d9f7be" }} />
            <h4>Desativar 2FA</h4>
            <p style={{ color: "#666", fontSize: 14 }}>
              Confirme com um código TOTP (6 dígitos) ou um backup code.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456 ou XXXX-XXXX"
              style={{
                padding: "10px 12px",
                fontSize: 16,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                width: 240,
                marginRight: 8,
              }}
            />
            <button
              type="button"
              onClick={handleDisable}
              disabled={working}
              style={{
                background: "#ff4d4f",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 4,
                cursor: working ? "not-allowed" : "pointer",
              }}
            >
              Desativar
            </button>
          </div>
        ) : setupData ? (
          <div style={{ background: "#fafafa", padding: 24, borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Escaneie o QR code</h3>
            <p>Abra o Google Authenticator (ou Authy) → "+ Adicionar conta" → escanear:</p>
            {qrUrl && (
              <img
                src={qrUrl}
                alt="QR code 2FA"
                style={{ display: "block", marginBottom: 16, border: "1px solid #d9d9d9" }}
              />
            )}
            <p style={{ fontSize: 12, color: "#666" }}>
              Não consegue escanear? Digite manualmente esse código no app:
              <br />
              <code
                style={{
                  background: "#fff",
                  padding: 4,
                  display: "inline-block",
                  marginTop: 4,
                  fontFamily: "monospace",
                  fontSize: 14,
                  border: "1px solid #eee",
                }}
              >
                {setupData.secret}
              </code>
            </p>
            <hr style={{ margin: "16px 0" }} />
            <h4>Digite o código gerado pelo app:</h4>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              style={{
                padding: "10px 12px",
                fontSize: 24,
                letterSpacing: 4,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                width: 160,
                marginRight: 8,
                fontFamily: "monospace",
              }}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={working}
              style={{
                background: "#1677ff",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 4,
                fontWeight: 600,
                cursor: working ? "not-allowed" : "pointer",
              }}
            >
              Confirmar e ativar
            </button>
          </div>
        ) : backupCodes ? (
          <div
            style={{ background: "#fffbe6", padding: 24, borderRadius: 8, border: "1px solid #ffe58f" }}
          >
            <h3 style={{ marginTop: 0, color: "#d48806" }}>⚠️ GUARDE estes códigos de backup</h3>
            <p>
              Use estes códigos se perder acesso ao app autenticador. Cada um pode ser usado{" "}
              <strong>1 única vez</strong>. Não terá outra chance de vê-los.
            </p>
            <div
              style={{
                background: "#fff",
                padding: 16,
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 16,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
                border: "1px solid #ffe58f",
              }}
            >
              {backupCodes.map((c, i) => (
                <div key={i}>{c}</div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join("\n"));
                toast.success("Copiado!");
              }}
              style={{
                marginTop: 16,
                background: "#1677ff",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              📋 Copiar todos
            </button>
            <button
              type="button"
              onClick={() => setBackupCodes(null)}
              style={{
                marginTop: 16,
                marginLeft: 8,
                background: "transparent",
                color: "#666",
                border: "1px solid #d9d9d9",
                padding: "8px 16px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Já guardei
            </button>
          </div>
        ) : (
          <div style={{ background: "#fafafa", padding: 24, borderRadius: 8 }}>
            <p>2FA está desativado. Ative agora pra proteger sua conta.</p>
            <button
              type="button"
              onClick={handleStartSetup}
              disabled={working}
              style={{
                background: "#1677ff",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 4,
                fontWeight: 600,
                cursor: working ? "not-allowed" : "pointer",
              }}
            >
              Ativar 2FA
            </button>
          </div>
        )}
      </div>
    </>
  );
};

TwoFaPage.authRoles = ["COWORKING", "CLIENT"];
TwoFaPage.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>
    <SettingsLayout>{page}</SettingsLayout>
  </CoworkingLayout>
);

export default TwoFaPage;
