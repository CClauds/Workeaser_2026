/**
 * Sprint L (HF-SPRINT-L-03) — Pagina publica de Termos de Uso.
 *
 * Versao resumida web, baseada no template completo `09_legal/TERMOS_DE_USO_TEMPLATE.md`.
 * Apontada pela landing page (footer).
 *
 * Para producao real: revisar com advogado e adaptar a jurisdicao.
 */
import React from "react";
import Head from "next/head";
import Link from "next/link";

const Terms = () => {
  return (
    <>
      <Head>
        <title>Termos de Uso — Workeaser</title>
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
            Termos de Uso
          </h1>
          <p style={{ color: "#737373", fontSize: 13, marginTop: 0 }}>
            Última atualização: 17 de maio de 2026
          </p>

          <section style={sectionStyle}>
            <h2 style={h2Style}>1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta no Workeaser (workeaser.com) você concorda
              com estes Termos de Uso e com nossa{" "}
              <Link href="/privacy" style={linkStyle}>
                Política de Privacidade
              </Link>
              . Se não concordar, não use o serviço.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>2. O que é o Workeaser</h2>
            <p>
              SaaS de gestão para coworkings. Inclui: cobrança recorrente
              via Stripe, contratos com assinatura digital (DocuSign),
              reservas de salas/mesas, mensagens transacionais via
              WhatsApp/Email/SMS, dashboards e relatórios.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Conta e responsabilidades</h2>
            <p>
              Você é responsável por:
            </p>
            <ul>
              <li>Manter a confidencialidade da sua senha (recomendamos ativar 2FA em Configurações);</li>
              <li>Todos os dados que você ou seus usuários inserem no sistema;</li>
              <li>Cumprir leis locais aplicáveis ao seu negócio (LGPD no Brasil, GDPR na UE);</li>
              <li>Pagar as mensalidades conforme o plano contratado.</li>
            </ul>
            <p>
              O Workeaser fornece a infraestrutura e ferramentas. Decisões
              comerciais (preço cobrado dos seus clientes, conteúdo dos
              contratos, política de cancelamento) são suas.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Planos e pagamento</h2>
            <p>
              Você escolhe entre Solo (USD 49/mês), Growth (USD 149/mês) ou
              Network (USD 499/mês). Trial de 14 dias grátis, sem cartão.
              Pagamento mensal recorrente via Stripe (cartão ou PIX).
              Reembolsos: pro-rata se cancelar antes de período renovar.
            </p>
            <p>
              Cancelamento: você pode cancelar a qualquer momento pelo
              painel (Configurações → Assinatura). Sem multa. Os dados ficam
              disponíveis para export por 30 dias após cancelamento.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Uso aceitável</h2>
            <p>É proibido usar o Workeaser para:</p>
            <ul>
              <li>Atividades ilegais ou que violem direitos de terceiros;</li>
              <li>Envio de SPAM via funcionalidade de email/WhatsApp;</li>
              <li>Tentativas de quebra de segurança ou abuso de API (rate limits aplicam);</li>
              <li>Revenda do serviço sem autorização escrita.</li>
            </ul>
            <p>
              Detectamos violações via audit log automático. Em caso de
              violação grave podemos suspender a conta sem aviso prévio.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Disponibilidade e SLA</h2>
            <p>
              Objetivo: 99.5% uptime mensal. Não oferecemos SLA contratual
              nos planos Solo/Growth — apenas best effort. Plano Network
              tem SLA escrito disponível mediante pedido. Janelas de
              manutenção programadas comunicadas com 48h de antecedência.
            </p>
            <p>
              Status em tempo real:{" "}
              <Link href="/status" style={linkStyle}>
                workeaser.com/status
              </Link>
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Propriedade intelectual</h2>
            <p>
              O código, marca, design e documentação do Workeaser são de
              propriedade exclusiva da Workeaser. Você mantém propriedade
              total dos dados que insere no sistema (clientes, contratos,
              faturas etc) — exportável a qualquer momento via{" "}
              <code>/api/me/export-data</code> (LGPD compliant).
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Limitação de responsabilidade</h2>
            <p>
              Em nenhum caso a Workeaser será responsável por danos
              indiretos, lucros cessantes ou perdas decorrentes de
              indisponibilidade do serviço — limitado ao valor pago nos
              últimos 12 meses. Você é responsável por manter backups
              próprios dos dados críticos (apesar de nossos backups
              automáticos diários).
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>9. Alterações dos termos</h2>
            <p>
              Podemos atualizar estes termos. Mudanças relevantes serão
              comunicadas por email com 30 dias de antecedência. Continuar
              usando após o prazo significa aceitação.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>10. Foro e legislação aplicável</h2>
            <p>
              Lei brasileira (LGPD, Marco Civil). Foro: São Paulo/SP. Para
              clientes UE: aplicamos também o GDPR.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>11. Contato</h2>
            <p>
              Dúvidas sobre estes termos:{" "}
              <a href="mailto:legal@workeaser.com" style={linkStyle}>
                legal@workeaser.com
              </a>
              <br />
              Outros assuntos:{" "}
              <Link href="/contact" style={linkStyle}>
                workeaser.com/contact
              </Link>
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
            Este é o resumo dos termos. A versão completa está em{" "}
            <code>09_legal/TERMOS_DE_USO_TEMPLATE.md</code> do pacote técnico
            (revisada com advogado antes de uso em produção).
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
            <Link href="/terms" style={footerLink}>
              Termos
            </Link>
            ·
            <Link href="/privacy" style={footerLink}>
              Privacidade
            </Link>
            ·
            <Link href="/contact" style={footerLink}>
              Contato
            </Link>
            ·
            <Link href="/status" style={footerLink}>
              Status
            </Link>
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
const linkStyle: React.CSSProperties = {
  color: "#0369a1",
  textDecoration: "none",
};
const footerLink: React.CSSProperties = {
  color: "#a3a3a3",
  textDecoration: "none",
  margin: "0 8px",
};

export default Terms;
