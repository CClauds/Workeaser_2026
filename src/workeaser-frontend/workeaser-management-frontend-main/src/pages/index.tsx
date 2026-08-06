/**
 * Sprint K (HF-SPRINT-K-02) — Landing page pública
 *
 * Antes (até Sprint J): index.tsx ficava VAZIO — só <Head>.
 *   Qualquer pessoa acessando workeaser.com via root via uma tela em branco.
 * Agora: landing que vende o produto e direciona pra signup/login.
 *
 * Auto-redirect: se usuário JÁ está logado (tem token em localStorage), pula direto
 *   pro dashboard. Senão mostra landing.
 *
 * Sem dependências externas além de Next + React — usado por SSG, carrega rápido.
 */
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const features = [
  {
    icon: "💳",
    title: "Cobrança recorrente automática",
    desc: "Stripe Subscriptions + PIX BR. Trial grátis configurável, upgrade/downgrade com proration. Customer Portal pra cliente baixar invoices sozinho.",
  },
  {
    icon: "📄",
    title: "Contratos com assinatura digital",
    desc: "DocuSign integrado nativo. Envia contrato → cliente assina pelo celular → sistema arquiva PDF + dispara cobrança.",
  },
  {
    icon: "🗓",
    title: "Reservas de salas e mesas",
    desc: "Calendário visual de salas de reunião + hot desks. Cliente reserva sozinho pelo app. Dia passe pago via PIX.",
  },
  {
    icon: "💬",
    title: "WhatsApp transacional",
    desc: "Lembretes de vencimento, contratos pra assinar, confirmação de reserva. Tudo via Meta Cloud API oficial (não WhatsApp Web hack).",
  },
  {
    icon: "📊",
    title: "Métricas SaaS de cowork",
    desc: "MRR, ARR, churn 30d, ARPU, ocupação por sala, cohort retention. Dashboards prontos pra investidor.",
  },
  {
    icon: "🔒",
    title: "Compliance LGPD nativo",
    desc: "Direito ao esquecimento, portabilidade de dados, banner de cookies, audit log de tudo. Pronto pra fiscalização.",
  },
];

const pricing = [
  {
    code: "solo",
    name: "Solo",
    price: "USD 49",
    interval: "/mês",
    desc: "Pra coworkings novos",
    highlights: [
      "1 local, até 30 membros",
      "30 contratos DocuSign/mês",
      "Suporte por e-mail",
      "Trial 14 dias grátis",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    code: "growth",
    name: "Growth",
    price: "USD 149",
    interval: "/mês",
    desc: "Mais escolhido",
    highlights: [
      "Até 3 locais, 150 membros",
      "200 contratos/mês",
      "WhatsApp transacional",
      "Métricas avançadas",
    ],
    cta: "Começar grátis",
    highlighted: true,
  },
  {
    code: "network",
    name: "Network",
    price: "USD 499",
    interval: "/mês",
    desc: "Pra redes de cowork",
    highlights: [
      "Locais ilimitados",
      "Membros ilimitados",
      "White-label / branding próprio",
      "IA de suporte 1ª linha",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
];

const Home = () => {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Auto-redirect se já logado
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const token =
        localStorage.getItem("workeaser.token") ||
        localStorage.getItem("token");
      if (token) {
        router.replace("/dashboard");
        return;
      }
    } catch {
      // ignore
    }
    setCheckedAuth(true);
  }, [router]);

  if (!checkedAuth) {
    return null; // evita flash da landing pra usuário logado
  }

  return (
    <>
      <Head>
        <title>Workeaser — Gestão completa pra coworkings</title>
        <meta
          name="description"
          content="Plataforma SaaS pra coworkings: cobrança recorrente, contratos digitais, reservas, WhatsApp, métricas. LGPD nativo. Trial 14 dias grátis."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta property="og:title" content="Workeaser — SaaS pra coworkings" />
        <meta
          property="og:description"
          content="Cobrança, contratos, reservas, WhatsApp, métricas. Tudo em 1 painel."
        />
        <meta property="og:type" content="website" />
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
        {/* Header */}
        <header
          style={{
            padding: "20px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
            Workeaser
          </div>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="#features" style={navLink}>
              Recursos
            </a>
            <a href="#pricing" style={navLink}>
              Preços
            </a>
            <a href="#faq" style={navLink}>
              FAQ
            </a>
            <Link
              href="/login"
              style={{
                ...navLink,
                fontWeight: 600,
              }}
            >
              Entrar
            </Link>
            <Link href="/signup" style={ctaButtonStyle}>
              Começar grátis →
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section
          style={{
            padding: "80px 40px 60px",
            maxWidth: 1100,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#f0f9ff",
              color: "#0369a1",
              padding: "6px 14px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            🚀 Plataforma brasileira, feita pra coworkings brasileiros
          </div>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              margin: "0 0 24px",
            }}
          >
            Gestão completa do seu cowork.
            <br />
            <span style={{ color: "#0369a1" }}>Sem planilha. Sem dor.</span>
          </h1>
          <p
            style={{
              fontSize: 20,
              color: "#525252",
              maxWidth: 680,
              margin: "0 auto 40px",
              lineHeight: 1.5,
            }}
          >
            Cobrança recorrente, contratos digitais, reservas de salas, WhatsApp
            transacional, métricas SaaS — tudo em 1 painel. LGPD nativo. Sem
            taxa por transação.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/signup" style={ctaButtonLargeStyle}>
              Começar 14 dias grátis →
            </Link>
            <a href="#demo" style={ctaSecondaryLargeStyle}>
              Ver demo (5 min)
            </a>
          </div>
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "#737373",
            }}
          >
            Sem cartão de crédito · Cancele a qualquer momento
          </p>
        </section>

        {/* Features */}
        <section
          id="features"
          style={{
            padding: "60px 40px",
            background: "#fafafa",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={sectionTitle}>Tudo que um cowork precisa</h2>
            <p style={sectionSubtitle}>
              Substitui Excel, WhatsApp pessoal, papel timbrado, e 3 SaaS que
              você paga sem usar 100%.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
                marginTop: 48,
              }}
            >
              {features.map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "#fff",
                    padding: 28,
                    borderRadius: 12,
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: "0 0 8px",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#525252",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ padding: "80px 40px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={sectionTitle}>Preço simples. Sem surpresa.</h2>
            <p style={sectionSubtitle}>
              Cobra o cowork uma vez por mês. Sem taxa por transação. Sem trava
              de contrato anual.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
                marginTop: 48,
              }}
            >
              {pricing.map((p) => (
                <div
                  key={p.code}
                  style={{
                    background: p.highlighted ? "#0369a1" : "#fff",
                    color: p.highlighted ? "#fff" : "#1a1a1a",
                    padding: 32,
                    borderRadius: 12,
                    border: p.highlighted
                      ? "2px solid #0369a1"
                      : "1px solid #e5e5e5",
                    position: "relative",
                    boxShadow: p.highlighted
                      ? "0 10px 40px rgba(3,105,161,0.2)"
                      : "none",
                  }}
                >
                  {p.highlighted && (
                    <div
                      style={{
                        position: "absolute",
                        top: -12,
                        right: 24,
                        background: "#fbbf24",
                        color: "#1a1a1a",
                        padding: "4px 12px",
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      MAIS POPULAR
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      opacity: 0.8,
                      marginBottom: 8,
                    }}
                  >
                    {p.desc}
                  </div>
                  <h3
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      margin: "0 0 12px",
                    }}
                  >
                    {p.name}
                  </h3>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 40, fontWeight: 800 }}>
                      {p.price}
                    </span>
                    <span style={{ fontSize: 16, opacity: 0.7 }}>
                      {p.interval}
                    </span>
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "0 0 24px",
                    }}
                  >
                    {p.highlights.map((h) => (
                      <li
                        key={h}
                        style={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          marginBottom: 8,
                          paddingLeft: 24,
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 1,
                            color: p.highlighted ? "#fbbf24" : "#16a34a",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "12px 24px",
                      background: p.highlighted ? "#fff" : "#1a1a1a",
                      color: p.highlighted ? "#0369a1" : "#fff",
                      borderRadius: 8,
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: 15,
                    }}
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo / CTA */}
        <section
          id="demo"
          style={{
            padding: "80px 40px",
            background: "#0369a1",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                margin: "0 0 16px",
                letterSpacing: -1,
              }}
            >
              Veja em 5 minutos como funciona
            </h2>
            <p
              style={{
                fontSize: 18,
                opacity: 0.9,
                marginBottom: 32,
                lineHeight: 1.5,
              }}
            >
              Trial de 14 dias com 1 location demo já populada. Você cria sua
              conta e em 30s tem mesa, sala, plano e um cliente fictício pra
              brincar.
            </p>
            <Link
              href="/signup"
              style={{
                display: "inline-block",
                padding: "16px 40px",
                background: "#fbbf24",
                color: "#1a1a1a",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 17,
                textDecoration: "none",
              }}
            >
              Criar conta grátis →
            </Link>
            <p style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
              Conta demo: <strong>demo@workeaser.com</strong> / senha:{" "}
              <strong>demo1234</strong>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          style={{ padding: "80px 40px", background: "#fafafa" }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2 style={sectionTitle}>Perguntas frequentes</h2>
            <div style={{ marginTop: 40 }}>
              {[
                {
                  q: "Preciso de cartão pra começar o trial?",
                  a: "Não. 14 dias 100% grátis, sem cadastro de cartão. Só pede quando converter.",
                },
                {
                  q: "E se eu cancelar?",
                  a: "Cancela quando quiser direto no painel. Sem multa. Os dados ficam disponíveis pra export (LGPD) por 30 dias.",
                },
                {
                  q: "Tem taxa por transação?",
                  a: "Não. Só a mensalidade. As taxas de cartão/PIX são do Stripe diretamente (1.99-3.99% + R$0.30).",
                },
                {
                  q: "Funciona com meu cowork pequeno (3 mesas)?",
                  a: "Funciona. O plano Solo é exatamente pra isso. Sem mínimo de cliente.",
                },
                {
                  q: "Posso usar meu domínio próprio?",
                  a: "No plano Network (white-label) sim. Solo/Growth usam workeaser.com/seu-cowork.",
                },
                {
                  q: "Vocês têm app mobile?",
                  a: "O painel é responsivo (funciona no celular). App nativo iOS/Android: roadmap Q3 2026.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  style={{
                    padding: "16px 20px",
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <summary
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      listStyle: "none",
                    }}
                  >
                    {item.q}
                  </summary>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#525252",
                      lineHeight: 1.6,
                      margin: "12px 0 0",
                    }}
                  >
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: "40px",
            background: "#1a1a1a",
            color: "#a3a3a3",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: "#fff" }}>Workeaser</strong> · SaaS pra
            coworkings
          </div>
          <div style={{ marginBottom: 16 }}>
            <a
              href="/terms"
              style={{ color: "#a3a3a3", textDecoration: "none", margin: "0 8px" }}
            >
              Termos
            </a>
            ·
            <a
              href="/privacy"
              style={{ color: "#a3a3a3", textDecoration: "none", margin: "0 8px" }}
            >
              Privacidade
            </a>
            ·
            <a
              href="mailto:contato@workeaser.com"
              style={{ color: "#a3a3a3", textDecoration: "none", margin: "0 8px" }}
            >
              contato@workeaser.com
            </a>
          </div>
          <div style={{ opacity: 0.7 }}>© 2026 Workeaser. CNPJ XX.XXX.XXX/0001-XX</div>
        </footer>
      </main>
    </>
  );
};

const navLink: React.CSSProperties = {
  color: "#525252",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
};

const ctaButtonStyle: React.CSSProperties = {
  background: "#0369a1",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};

const ctaButtonLargeStyle: React.CSSProperties = {
  background: "#0369a1",
  color: "#fff",
  padding: "16px 32px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 17,
};

const ctaSecondaryLargeStyle: React.CSSProperties = {
  background: "transparent",
  color: "#0369a1",
  border: "2px solid #0369a1",
  padding: "14px 30px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 17,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 40,
  fontWeight: 800,
  textAlign: "center",
  letterSpacing: -1,
  margin: 0,
};

const sectionSubtitle: React.CSSProperties = {
  fontSize: 18,
  color: "#525252",
  textAlign: "center",
  marginTop: 16,
  lineHeight: 1.5,
};

export default Home;
