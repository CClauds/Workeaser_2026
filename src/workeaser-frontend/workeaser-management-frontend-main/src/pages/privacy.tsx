/**
 * Sprint L (HF-SPRINT-L-03) — Pagina publica de Politica de Privacidade.
 *
 * Versao resumida web, baseada no template `09_legal/POLITICA_PRIVACIDADE_TEMPLATE.md`.
 * LGPD + GDPR compliant em estrutura.
 */
import React from "react";
import Head from "next/head";
import Link from "next/link";

const Privacy = () => {
  return (
    <>
      <Head>
        <title>Política de Privacidade — Workeaser</title>
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
            style={{
              fontSize: 14,
              color: "#525252",
              textDecoration: "none",
            }}
          >
            ← Voltar
          </Link>
        </header>

        <article
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "60px 32px",
            lineHeight: 1.7,
            fontSize: 15,
            color: "#333",
          }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: -0.5,
              margin: "0 0 8px",
            }}
          >
            Política de Privacidade
          </h1>
          <p style={{ color: "#737373", fontSize: 13, marginTop: 0 }}>
            Última atualização: 17 de maio de 2026 · Compatível com LGPD (Brasil) e GDPR (UE)
          </p>

          <section style={sectionStyle}>
            <h2 style={h2Style}>1. Resumo executivo (TL;DR)</h2>
            <ul>
              <li>Coletamos só o necessário pra rodar o serviço (nome, email, dados de cobrança, uso da plataforma).</li>
              <li>Não vendemos seus dados pra ninguém. Nunca.</li>
              <li>Você pode exportar seus dados completos a qualquer momento via{" "}
                <Link href="/settings/privacy" style={linkStyle}>Configurações → Privacidade</Link>.
              </li>
              <li>Você pode solicitar exclusão da sua conta (direito ao esquecimento LGPD/GDPR).</li>
              <li>Usamos cookies essenciais por padrão. Analytics opcional (banner pede consentimento).</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>2. Que dados coletamos</h2>

            <h3 style={h3Style}>2.1 Dados que você fornece</h3>
            <ul>
              <li>Nome, email, telefone (cadastro)</li>
              <li>Endereço da sua filial de cowork (criação de location)</li>
              <li>Dados de cartão de crédito — processados pelo Stripe, nunca chegam ao nosso servidor</li>
              <li>Dados dos seus clientes (membros do cowork) que você insere</li>
              <li>Conteúdo de contratos e faturas</li>
            </ul>

            <h3 style={h3Style}>2.2 Dados coletados automaticamente</h3>
            <ul>
              <li>Logs de acesso (IP, user agent, timestamps) — retidos 90 dias</li>
              <li>Métricas de uso anonimizadas (qual feature foi usada, quantas vezes)</li>
              <li>Erros e crashes (via Sentry, sem dados pessoais)</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Para que usamos</h2>
            <ul>
              <li>Fornecer o serviço (rodar seu cowork)</li>
              <li>Cobrar mensalidades (via Stripe)</li>
              <li>Suporte técnico quando você contata</li>
              <li>Comunicação operacional (notificações de fatura, mudanças no serviço)</li>
              <li>Melhoria do produto (métricas agregadas e anonimizadas)</li>
            </ul>
            <p>
              <strong>Não usamos para:</strong> marketing pra terceiros, venda de dados,
              perfilamento publicitário, ou qualquer fim além do necessário pra
              rodar o serviço que você contratou.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Compartilhamento com terceiros</h2>
            <p>
              Usamos sub-processadores para entregar funcionalidades. Cada um
              tem contrato de DPA (Data Processing Agreement) conosco e segue
              LGPD/GDPR. Lista atualizada:
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
                marginTop: 16,
              }}
            >
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={thStyle}>Sub-processador</th>
                  <th style={thStyle}>Finalidade</th>
                  <th style={thStyle}>Local dos dados</th>
                </tr>
              </thead>
              <tbody>
                <tr style={trStyle}><td style={tdStyle}>Stripe</td><td style={tdStyle}>Pagamentos</td><td style={tdStyle}>EUA / UE</td></tr>
                <tr style={trStyle}><td style={tdStyle}>AWS (SES, S3)</td><td style={tdStyle}>Email, armazenamento</td><td style={tdStyle}>EUA</td></tr>
                <tr style={trStyle}><td style={tdStyle}>DocuSign</td><td style={tdStyle}>Assinatura de contratos</td><td style={tdStyle}>EUA</td></tr>
                <tr style={trStyle}><td style={tdStyle}>Meta (WhatsApp)</td><td style={tdStyle}>Mensageria transacional</td><td style={tdStyle}>EUA / Brasil</td></tr>
                <tr style={trStyle}><td style={tdStyle}>Plaid</td><td style={tdStyle}>Conciliação bancária (opt-in)</td><td style={tdStyle}>EUA</td></tr>
                <tr style={trStyle}><td style={tdStyle}>Sentry</td><td style={tdStyle}>Monitoramento de erros</td><td style={tdStyle}>EUA</td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: 16, fontSize: 13, color: "#737373" }}>
              Lista completa de sub-processadores e DPAs:{" "}
              <code>09_legal/DPA_SUBPROCESSADORES.md</code>
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Seus direitos (LGPD/GDPR)</h2>
            <p>Você pode, a qualquer momento:</p>
            <ul>
              <li>
                <strong>Acessar:</strong>{" "}
                <Link href="/settings/privacy" style={linkStyle}>Configurações → Privacidade</Link>{" "}
                → "Exportar meus dados" baixa JSON completo
              </li>
              <li>
                <strong>Corrigir:</strong> editar dados de perfil, conta, cliente em qualquer
                tela
              </li>
              <li>
                <strong>Excluir:</strong> Configurações → Privacidade → "Solicitar exclusão de
                conta" → janela de 7 dias pra você cancelar
              </li>
              <li>
                <strong>Portar:</strong> mesmo botão de export, dados em formato JSON
                padronizado
              </li>
              <li>
                <strong>Opor-se ao processamento:</strong> contate{" "}
                <a href="mailto:privacy@workeaser.com" style={linkStyle}>
                  privacy@workeaser.com
                </a>
              </li>
            </ul>
            <p>Resposta em até 15 dias (LGPD) ou 30 dias (GDPR).</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Cookies</h2>
            <ul>
              <li>
                <strong>Essenciais</strong> (sempre ativos): sessão, autenticação, CSRF
              </li>
              <li>
                <strong>Funcionais</strong> (opt-in via banner): preferências de tema
              </li>
              <li>
                <strong>Analytics</strong> (opt-in via banner): PostHog,
                Google Analytics — apenas se você consentir
              </li>
            </ul>
            <p>Você pode revisar/revogar consentimento a qualquer momento pelo banner.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Retenção de dados</h2>
            <ul>
              <li>Dados de conta ativa: enquanto a conta existe</li>
              <li>Após cancelamento: 30 dias (período de "vala de recuperação")</li>
              <li>Após exclusão LGPD: 0 dias (anonimização imediata)</li>
              <li>Logs de auditoria: 24 meses (legal/compliance)</li>
              <li>Faturas pagas: 5 anos (legislação tributária brasileira)</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Segurança</h2>
            <ul>
              <li>HTTPS obrigatório em todas as comunicações</li>
              <li>Senhas: bcrypt com salt único por usuário</li>
              <li>Tokens OAuth e dados sensíveis: criptografados em repouso (AES-256-GCM)</li>
              <li>Rate limiting contra brute-force</li>
              <li>2FA disponível (recomendado para todos os admins)</li>
              <li>Audit log de acessos críticos</li>
              <li>Backups diários, retenção 30 dias</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>9. Incidentes de segurança</h2>
            <p>
              Em caso de violação de dados pessoais, notificamos:
            </p>
            <ul>
              <li>Você (afetado): em até 72h</li>
              <li>ANPD (autoridade brasileira): em até 72h se houver risco relevante</li>
              <li>DPO/encarregado da UE: em até 72h se houver dados de cidadãos UE</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>10. Contato — Encarregado de Dados (DPO)</h2>
            <p>
              <a href="mailto:privacy@workeaser.com" style={linkStyle}>
                privacy@workeaser.com
              </a>
              <br />
              Resposta em até 5 dias úteis.
            </p>
          </section>

          <p
            style={{
              marginTop: 48,
              padding: 16,
              background: "#fafafa",
              borderRadius: 8,
              fontSize: 13,
              color: "#737373",
            }}
          >
            Versão completa com modelo de DPO e mapeamento detalhado:{" "}
            <code>09_legal/POLITICA_PRIVACIDADE_TEMPLATE.md</code> e{" "}
            <code>09_legal/DPA_SUBPROCESSADORES.md</code>.
          </p>
        </article>

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

const sectionStyle: React.CSSProperties = { marginTop: 32 };
const h2Style: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginTop: 0,
  marginBottom: 12,
};
const h3Style: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginTop: 16,
  marginBottom: 8,
};
const linkStyle: React.CSSProperties = { color: "#0369a1", textDecoration: "none" };
const footerLink: React.CSSProperties = {
  color: "#a3a3a3",
  textDecoration: "none",
  margin: "0 8px",
};
const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontWeight: 600,
  fontSize: 13,
  textAlign: "left",
  borderBottom: "1px solid #e5e5e5",
};
const tdStyle: React.CSSProperties = { padding: "10px 12px" };
const trStyle: React.CSSProperties = { borderBottom: "1px solid #f5f5f5" };

export default Privacy;
