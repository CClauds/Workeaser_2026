/**
 * Sprint L (HF-SPRINT-L-03) — Pagina publica de Contato.
 *
 * Sem backend (formulario dispara mailto). Mais simples + funcional pro
 * volume atual (fase de aquisicao). Quando volumes crescerem, plugar com
 * service de tickets (Zendesk, Intercom, etc).
 */
import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";

const SUPPORT_EMAIL = "contato@workeaser.com";
const PRIVACY_EMAIL = "privacy@workeaser.com";
const LEGAL_EMAIL = "legal@workeaser.com";

const subjects = [
  { value: "demo", label: "Quero agendar uma demo" },
  { value: "sales", label: "Dúvida sobre planos / preço" },
  { value: "trial", label: "Estou no trial e travei em algo" },
  { value: "support", label: "Sou cliente e preciso de suporte" },
  { value: "partnership", label: "Parceria / integração" },
  { value: "other", label: "Outro assunto" },
];

const Contact = () => {
  const [subject, setSubject] = useState("demo");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coworkName, setCoworkName] = useState("");
  const [message, setMessage] = useState("");

  const buildMailto = () => {
    const sel = subjects.find((s) => s.value === subject);
    const subjectLine = `[Workeaser] ${sel?.label || "Contato"}`;
    const body = [
      `Nome: ${name}`,
      `Email: ${email}`,
      coworkName ? `Cowork: ${coworkName}` : null,
      "",
      "Mensagem:",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subjectLine
    )}&body=${encodeURIComponent(body)}`;
    return url;
  };

  return (
    <>
      <Head>
        <title>Contato — Workeaser</title>
        <meta
          name="description"
          content="Fale com a Workeaser: vendas, suporte, parcerias, dúvidas."
        />
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
            style={{
              fontSize: 14,
              color: "#525252",
              textDecoration: "none",
            }}
          >
            ← Voltar
          </Link>
        </header>

        <section
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "60px 32px",
          }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: -0.5,
              margin: "0 0 12px",
              textAlign: "center",
            }}
          >
            Fala com a gente
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#525252",
              textAlign: "center",
              marginTop: 0,
              marginBottom: 40,
              lineHeight: 1.5,
            }}
          >
            Sem chatbot. Sem fila. Resposta direta em &lt;24h pelo email do
            Rogerio (dono).
          </p>

          {/* Form */}
          <div
            style={{
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 32,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Assunto</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={inputStyle}
              >
                {subjects.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Cowork (opcional)</label>
              <input
                type="text"
                value={coworkName}
                onChange={(e) => setCoworkName(e.target.value)}
                placeholder="Nome do seu cowork (se aplicável)"
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Mensagem *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Me conte o que precisa. Sem filtro, sem precisar formalizar."
                rows={6}
                style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
              />
            </div>

            <a
              href={buildMailto()}
              onClick={(e) => {
                if (!name || !email || !message) {
                  e.preventDefault();
                  alert("Preencha nome, email e mensagem antes de enviar.");
                }
              }}
              style={{
                display: "block",
                marginTop: 24,
                padding: "14px 32px",
                background: "#0369a1",
                color: "#fff",
                textAlign: "center",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                textDecoration: "none",
              }}
            >
              Enviar email →
            </a>

            <p
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "#737373",
                textAlign: "center",
              }}
            >
              Vai abrir seu programa de email com tudo preenchido. Você
              confirma o envio.
            </p>
          </div>

          {/* Direct emails */}
          <div
            style={{
              marginTop: 32,
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 12,
              padding: 24,
              fontSize: 14,
              color: "#0369a1",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "#0c4a6e" }}>Prefere email direto?</strong>
            <div style={{ marginTop: 12 }}>
              <div>📧 <strong>Geral / Vendas / Suporte:</strong>{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} style={emailLinkStyle}>{SUPPORT_EMAIL}</a>
              </div>
              <div>🔒 <strong>Privacidade / LGPD:</strong>{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} style={emailLinkStyle}>{PRIVACY_EMAIL}</a>
              </div>
              <div>⚖ <strong>Jurídico:</strong>{" "}
                <a href={`mailto:${LEGAL_EMAIL}`} style={emailLinkStyle}>{LEGAL_EMAIL}</a>
              </div>
            </div>
          </div>

          {/* SLA */}
          <div
            style={{
              marginTop: 24,
              padding: 16,
              fontSize: 13,
              color: "#737373",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            <strong>Tempo de resposta esperado:</strong>
            <br />
            Vendas / Demo: até 24h · Suporte cliente: até 12h · Privacidade: até 5 dias úteis
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#1a1a1a",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #d4d4d4",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "inherit",
  background: "#fff",
  boxSizing: "border-box",
};

const emailLinkStyle: React.CSSProperties = {
  color: "#0369a1",
  textDecoration: "underline",
  fontWeight: 600,
};

const footerLink: React.CSSProperties = {
  color: "#a3a3a3",
  textDecoration: "none",
  margin: "0 8px",
};

export default Contact;
