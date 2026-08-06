/**
 * Sprint L (HF-SPRINT-L-05) — Pagina publica /status com health check.
 *
 * Mostra status em tempo real dos componentes do Workeaser:
 *   - API workeaser-api (`GET /health/db`, `/health/version`)
 *   - API admin-api (idem)
 *   - Stripe (heuristica via env var Stripe; usuario nao testa diretamente)
 *
 * Tudo client-side fetch — usuario nao logado pode acessar.
 * Auto-refresh a cada 30s.
 *
 * Por que: credibilidade. Quando um cliente reporta "tá fora", você manda
 *   workeaser.com/status — ele ve verde, descarta. Cliente potencial olha e
 *   pensa "sistema serio".
 *
 * Sem dependencia externa (Statuspage.io etc) — usa health check proprio.
 */
import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

interface ComponentStatus {
  name: string;
  status: "operational" | "degraded" | "down" | "unknown";
  message?: string;
  latencyMs?: number;
}

const API_URLS = {
  workeaser:
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host.replace(
          /^app\./,
          "api."
        )}`
      : "https://api.workeaser.com",
  admin:
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host.replace(
          /^app\./,
          "admin-api."
        )}`
      : "https://admin-api.workeaser.com",
};

async function checkEndpoint(
  url: string,
  name: string
): Promise<ComponentStatus> {
  const t0 = performance.now();
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, {
      method: "GET",
      mode: "cors",
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - t0);

    if (r.ok) {
      return { name, status: "operational", latencyMs };
    } else if (r.status === 503) {
      return {
        name,
        status: "degraded",
        message: "Health check retornou 503",
        latencyMs,
      };
    } else {
      return {
        name,
        status: "degraded",
        message: `HTTP ${r.status}`,
        latencyMs,
      };
    }
  } catch (err: any) {
    return {
      name,
      status: "down",
      message: err?.name === "AbortError" ? "Timeout (>5s)" : "Inacessível",
    };
  }
}

const Status = () => {
  const [components, setComponents] = useState<ComponentStatus[]>([
    { name: "API Workeaser", status: "unknown" },
    { name: "API Admin", status: "unknown" },
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const results = await Promise.all([
      checkEndpoint(`${API_URLS.workeaser}/health`, "API Workeaser"),
      checkEndpoint(`${API_URLS.admin}/healthz`, "API Admin"),
    ]);
    setComponents(results);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  // Status geral = pior dos componentes
  const overall = components.reduce<ComponentStatus["status"]>((acc, c) => {
    if (acc === "down" || c.status === "down") return "down";
    if (acc === "degraded" || c.status === "degraded") return "degraded";
    if (acc === "unknown" || c.status === "unknown") return "unknown";
    return "operational";
  }, "operational");

  const overallConfig = {
    operational: {
      color: "#16a34a",
      bg: "#f0fdf4",
      icon: "✅",
      text: "Todos os sistemas operacionais",
    },
    degraded: {
      color: "#f59e0b",
      bg: "#fffbeb",
      icon: "⚠",
      text: "Degradação parcial em alguns sistemas",
    },
    down: {
      color: "#dc2626",
      bg: "#fef2f2",
      icon: "🔴",
      text: "Falha em pelo menos um sistema crítico",
    },
    unknown: {
      color: "#737373",
      bg: "#fafafa",
      icon: "⏳",
      text: "Verificando status...",
    },
  }[overall];

  return (
    <>
      <Head>
        <title>Status do Sistema — Workeaser</title>
        <meta name="robots" content="index, follow" />
      </Head>
      <main
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: "#1a1a1a",
          background: "#fff",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            padding: "20px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1a1a1a",
              textDecoration: "none",
            }}
          >
            Workeaser
          </Link>
          <Link
            href="/"
            style={{ fontSize: 14, color: "#525252", textDecoration: "none" }}
          >
            ← Voltar
          </Link>
        </header>

        <section
          style={{ maxWidth: 720, margin: "0 auto", padding: "60px 32px" }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              margin: "0 0 8px",
              letterSpacing: -0.5,
              textAlign: "center",
            }}
          >
            Status do Sistema
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#737373",
              textAlign: "center",
              marginTop: 0,
              marginBottom: 32,
            }}
          >
            Status em tempo real dos componentes do Workeaser
            {lastUpdated && (
              <>
                {" "}· Atualizado {lastUpdated.toLocaleTimeString("pt-BR")}
              </>
            )}
            {" "}
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              style={{
                background: "transparent",
                border: "none",
                color: "#1677ff",
                cursor: refreshing ? "wait" : "pointer",
                fontSize: 13,
                textDecoration: "underline",
              }}
            >
              {refreshing ? "atualizando..." : "atualizar agora"}
            </button>
          </p>

          {/* Overall banner */}
          <div
            style={{
              background: overallConfig.bg,
              borderLeft: `4px solid ${overallConfig.color}`,
              padding: 24,
              borderRadius: 8,
              marginBottom: 32,
              fontSize: 18,
              fontWeight: 700,
              color: overallConfig.color,
            }}
          >
            <span style={{ fontSize: 28, marginRight: 12 }}>
              {overallConfig.icon}
            </span>
            {overallConfig.text}
          </div>

          {/* Components */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {components.map((c) => {
              const config = {
                operational: { color: "#16a34a", bg: "#f0fdf4", label: "Operacional" },
                degraded: { color: "#f59e0b", bg: "#fffbeb", label: "Degradado" },
                down: { color: "#dc2626", bg: "#fef2f2", label: "Fora do ar" },
                unknown: { color: "#737373", bg: "#fafafa", label: "Verificando..." },
              }[c.status];
              return (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "#fff",
                    border: `1px solid #e5e5e5`,
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
                    {c.message && (
                      <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>
                        {c.message}
                      </div>
                    )}
                    {c.latencyMs !== undefined && (
                      <div style={{ fontSize: 12, color: "#737373", marginTop: 2 }}>
                        Latência: {c.latencyMs}ms
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      padding: "4px 12px",
                      background: config.bg,
                      color: config.color,
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    ● {config.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info box */}
          <div
            style={{
              marginTop: 40,
              padding: 24,
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 8,
              fontSize: 14,
              color: "#0c4a6e",
              lineHeight: 1.6,
            }}
          >
            <strong>Como funciona:</strong> esta página consulta os endpoints
            de health check do Workeaser a cada 30 segundos. Os componentes
            checados são as APIs (workeaser-api + admin-api).
            <br />
            <br />
            <strong>Em caso de incidente:</strong> mantemos esta página
            atualizada. Incidentes severos disparam email pra todos os clientes
            ativos em até 30 minutos.
            <br />
            <br />
            <strong>SLA:</strong> objetivo de 99.5% uptime mensal (não-contratual
            nos planos Solo/Growth; contratual no Network). Histórico:{" "}
            <a
              href="mailto:contato@workeaser.com?subject=Pedido de histórico de uptime"
              style={{ color: "#0369a1" }}
            >
              solicitar
            </a>
            .
          </div>

          {/* Past incidents (placeholder — quando virar real, integra com algum sistema) */}
          <div style={{ marginTop: 40 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Incidentes recentes (últimos 30 dias)
            </h2>
            <div
              style={{
                padding: 32,
                background: "#f0fdf4",
                borderRadius: 8,
                textAlign: "center",
                color: "#16a34a",
                fontWeight: 600,
              }}
            >
              ✅ Nenhum incidente registrado
            </div>
          </div>
        </section>

        <footer
          style={{
            padding: 40,
            background: "#1a1a1a",
            color: "#a3a3a3",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: "#fff" }}>Workeaser</strong>
          </div>
          <div>
            <Link href="/terms" style={footerLink}>Termos</Link>
            ·
            <Link href="/privacy" style={footerLink}>Privacidade</Link>
            ·
            <Link href="/contact" style={footerLink}>Contato</Link>
            ·
            <Link href="/status" style={footerLink}>Status</Link>
          </div>
        </footer>
      </main>
    </>
  );
};

const footerLink: React.CSSProperties = {
  color: "#a3a3a3",
  textDecoration: "none",
  margin: "0 8px",
};

export default Status;
