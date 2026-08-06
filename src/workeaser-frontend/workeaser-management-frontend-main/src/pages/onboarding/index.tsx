/**
 * Sprint K (HF-SPRINT-K-04) — Onboarding wizard pós-signup.
 *
 * Decisão de design: em vez de duplicar formulários (que viraria divergência das
 * páginas reais), o wizard é uma CHECKLIST com 5 cards que linka pras páginas
 * existentes. Cada card detecta sozinho se o passo já foi feito (consultando API)
 * e mostra ✅ quando completo.
 *
 * Fluxo:
 *   1. Usuário faz signup
 *   2. Email confirmation
 *   3. Redirect pra /onboarding (em vez de /dashboard direto)
 *   4. Cumpre os 5 passos (ou skipa)
 *   5. localStorage marca como concluído → próximos logins vão direto pro dashboard
 *
 * Auto-redirect: se já marcou completo (localStorage workeaser.onboarded=1)
 *   E voltou aqui manualmente, mostra a checklist normalmente (revisão).
 */
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { getAPIClient } from "@services/apiClient";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, useEffect, useState } from "react";

const ONBOARDING_STORAGE_KEY = "workeaser.onboarded";

interface Step {
  id: string;
  icon: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /** Função async que devolve true se o passo já foi cumprido */
  checkDone: () => Promise<boolean>;
}

const STEPS: Step[] = [
  {
    id: "company",
    icon: "🏢",
    title: "Cadastre sua primeira filial",
    description:
      "É o local físico onde os membros trabalham. Endereço, descrição, fotos. Você pode adicionar mais depois.",
    ctaLabel: "Criar filial →",
    ctaHref: "/locations/create",
    checkDone: async () => {
      try {
        const api = getAPIClient();
        const { data } = await api.get("/cowork/locations?page=1");
        const list = data?.result || data?.locations || [];
        return Array.isArray(list) && list.length > 0;
      } catch {
        return false;
      }
    },
  },
  {
    id: "spaces",
    icon: "🪑",
    title: "Adicione mesas ou salas",
    description:
      "Mesa fixa (membro privativa), hot desk (compartilhada), sala de reunião. Define preço e mínimo de aluguel.",
    ctaLabel: "Configurar espaços →",
    ctaHref: "/spaces",
    checkDone: async () => {
      try {
        const api = getAPIClient();
        const { data } = await api.get("/cowork/desks?page=1");
        const list = data?.result || [];
        return Array.isArray(list) && list.length > 0;
      } catch {
        return false;
      }
    },
  },
  {
    id: "plan",
    icon: "💳",
    title: "Escolha seu plano Workeaser",
    description:
      "14 dias grátis. Depois cobrança mensal no cartão ou PIX. Cancele quando quiser.",
    ctaLabel: "Ver planos →",
    ctaHref: "/settings/subscriptions/upgrade",
    checkDone: async () => {
      try {
        const api = getAPIClient();
        const { data } = await api.get("/cowork/subscriptions");
        const list = data?.result || [];
        return (
          Array.isArray(list) &&
          list.some((s: any) =>
            ["active", "trialing", "past_due"].includes(s?.status)
          )
        );
      } catch {
        return false;
      }
    },
  },
  {
    id: "team",
    icon: "👥",
    title: "Convide sua equipe",
    description:
      "Recepção, gerente, financeiro. Cada um com permissões próprias (não precisa dar admin pra todo mundo).",
    ctaLabel: "Convidar equipe →",
    ctaHref: "/cowork-team",
    checkDone: async () => {
      try {
        const api = getAPIClient();
        const { data } = await api.get("/cowork/employees?page=1");
        const list = data?.result || [];
        return Array.isArray(list) && list.length > 0;
      } catch {
        return false;
      }
    },
  },
  {
    id: "branding",
    icon: "🎨",
    title: "Personalize o painel (opcional)",
    description:
      "Logo, cores, domínio próprio (no plano Network). Não é obrigatório — o sistema funciona com defaults.",
    ctaLabel: "Personalizar →",
    ctaHref: "/settings",
    checkDone: async () => {
      // sempre opcional → marca como done se usuário já entrou em settings
      // (heurística simples: localStorage flag setada pela página settings)
      if (typeof window === "undefined") return false;
      return localStorage.getItem("workeaser.branding_seen") === "1";
    },
  },
];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }
  return { props: {} };
};

const Onboarding = () => {
  const router = useRouter();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results: Record<string, boolean> = {};
      await Promise.all(
        STEPS.map(async (s) => {
          results[s.id] = await s.checkDone();
        })
      );
      if (mounted) {
        setDone(results);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const completedCount = Object.values(done).filter(Boolean).length;
  const totalCount = STEPS.length;
  const allDone = completedCount === totalCount;
  const minimumDone =
    done["company"] && done["spaces"] && done["plan"]; // 3 críticos

  const handleFinish = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    router.push("/dashboard");
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "skipped");
    } catch {
      // ignore
    }
    router.push("/dashboard");
  };

  return (
    <>
      <Head>
        <title>Configurar seu cowork — Workeaser</title>
      </Head>
      <div style={{ padding: "40px 20px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            👋 Bem-vindo ao Workeaser!
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#525252",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Vamos configurar seu coworking em 5 passos rápidos. Dá pra fazer em
            10 minutos — ou continuar depois.
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginBottom: 28,
            background: "#f0f0f0",
            borderRadius: 100,
            height: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(completedCount / totalCount) * 100}%`,
              height: "100%",
              background: allDone ? "#16a34a" : "#1677ff",
              transition: "width 0.3s",
            }}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#525252",
            marginBottom: 32,
          }}
        >
          {loading
            ? "Verificando seu progresso..."
            : `${completedCount} de ${totalCount} concluído${
                completedCount !== 1 ? "s" : ""
              }`}
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STEPS.map((s, idx) => {
            const isDone = done[s.id];
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 20,
                  background: isDone ? "#f0fdf4" : "#fff",
                  border: `1px solid ${isDone ? "#86efac" : "#e5e5e5"}`,
                  borderRadius: 10,
                  opacity: loading ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isDone ? "#16a34a" : "#f5f5f5",
                    color: isDone ? "#fff" : "#1a1a1a",
                    borderRadius: "50%",
                  }}
                  aria-hidden="true"
                >
                  {isDone ? "✓" : s.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      margin: "0 0 4px",
                      color: isDone ? "#16a34a" : "#1a1a1a",
                    }}
                  >
                    {idx + 1}. {s.title}
                    {isDone && (
                      <span style={{ fontSize: 12, marginLeft: 8 }}>
                        ✅ Pronto
                      </span>
                    )}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#737373",
                      margin: "0 0 12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.description}
                  </p>
                  {!isDone && (
                    <Link
                      href={s.ctaHref}
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        background: "#1677ff",
                        color: "#fff",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {s.ctaLabel}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: "transparent",
              border: "none",
              color: "#737373",
              fontSize: 14,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Pular onboarding e ir pro dashboard
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={!minimumDone}
            title={
              minimumDone
                ? "Concluir e ir pro dashboard"
                : "Complete os 3 primeiros passos (filial, espaços, plano) pra finalizar"
            }
            style={{
              padding: "12px 28px",
              background: minimumDone ? "#16a34a" : "#d4d4d4",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              cursor: minimumDone ? "pointer" : "not-allowed",
            }}
          >
            {allDone ? "✅ Pronto, ir pro dashboard" : "Finalizar onboarding"}
          </button>
        </div>

        {/* Help banner */}
        <div
          style={{
            marginTop: 40,
            padding: 20,
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: 10,
            fontSize: 14,
            color: "#92400e",
            lineHeight: 1.5,
          }}
        >
          💡 <strong>Dica:</strong> não precisa fazer tudo agora. Você pode
          voltar a esta tela quando quiser via menu lateral → "Configurar
          cowork". Os passos críticos pra começar a vender são 1, 2 e 3.
        </div>
      </div>
    </>
  );
};

Onboarding.getLayout = function getLayout(page: ReactElement) {
  return <CoworkingLayout>{page}</CoworkingLayout>;
};

export default Onboarding;
