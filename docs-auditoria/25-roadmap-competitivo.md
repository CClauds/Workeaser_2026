# Workeaser — Roadmap Competitivo (25)

> **Data:** 06/08/2026 — Agrupamento de prioridade (NÃO são prazos de entrega). Baseado na auditoria técnica + benchmark dos 10 concorrentes.

---

## 1. Correções imediatas (semanas 1-2)

| # | Item | Tipo | Evidência |
|---|---|---|---|
| 1 | Subir scheduler (`node ace scheduler:run` no compose) | P0 | [RUNTIME] |
| 2 | Consertar BoldSign (base URL) ou migrar para Docusign real | P0 | [RUNTIME] |
| 3 | Proteger POST /api/auth/import (auth+admin) | P0 | [CODIGO] |
| 4 | Rate limit no login admin | P0 | [CODIGO] |
| 5 | Normalizar emails compostos (~20 clientes) | P1 | [BANCO] |
| 6 | Fix meetroom price (unidade centavos) | P1 | [BANCO] |
| 7 | Cookie httpOnly | P1 | [CODIGO] |
| 8 | Credenciais reais (Google/Docusign/Plaid/Exchange) | P0 | [CONFIG] |

## 2. Próximos 30 dias

| # | Item | Tipo |
|---|---|---|
| 1 | VPS + backup offsite + domínio/SSL | P0 |
| 2 | Faturas recorrentes rodando (validar GenerateInvoice + Stripe produção) | P1 |
| 3 | Fluxo de correspondências: registro + notificação (usar módulo mailbox) | P0 |
| 4 | Inadimplência + lembretes automáticos | P1 |
| 5 | Rodar testes do admin-api e corrigir | P2 |
| 6 | Política de troca de senha dos clientes (1º login) | P1 |
| 7 | Stripe produção (charge/capture/refund reais) | P1 |

## 3. Próximos 90 dias

| # | Item | Tipo |
|---|---|---|
| 1 | Integração contínua QBO (clientes/invoices/payments) | P1 |
| 2 | Check-in QR no portal web | P1 |
| 3 | USPS Form 1583 + validade | P1 |
| 4 | CRM operacional com dados (usar leads/pipeline existentes) | P1 |
| 5 | PWA do cliente (base para app) | P1 |
| 6 | API pública + docs + tokens | P2 |
| 7 | Reserva de mesa (desks booking) | P2 |
| 8 | Eventos (módulo existe, vazio) | P2 |

## 4. Próximos 6 meses

| # | Item | Tipo |
|---|---|---|
| 1 | App nativo iOS/Android (ou continuar PWA maduro) | P1 |
| 2 | Controle de acesso (integração Kisi ou Salto) em 1-2 unidades piloto | P1 |
| 3 | Multi-idioma PT/EN/ES | P2 |
| 4 | Zapier/Make via webhooks públicos | P2 |
| 5 | Relatórios com dados reais + dashboards por unidade | P2 |
| 6 | Multi-tenancy piloto (2º coworking, ex.: Ocoee) | P2 |
| 7 | E2E tests (Playwright) nos fluxos críticos | P2 |

## 5. Longo prazo

| # | Item | Tipo |
|---|---|---|
| 1 | IA: assistente (WhatsApp) + previsão de ocupação | P3 |
| 2 | Licenciamento SaaS para outros coworkings | estratégico |
| 3 | Kiosk de recepção | P3 |
| 4 | Comunidade/marketplace B2B | P3 |
| 5 | ACH (US) + PIX (BR) | P2 |

---

## Critérios de saída para cada fase

- **Imediatas concluídas quando:** scheduler roda, BoldSign/Docusign assina, import protegido, login admin com rate limit, emails normalizados.
- **30 dias quando:** sistema acessível via domínio com SSL, backup offsite automático, 1ª fatura recorrente gerada e paga, correspondências registradas com notificação.
- **90 dias quando:** QBO sincronizando, check-in em uso, 1º contrato assinado eletronicamente, leads no pipeline, PWA publicado.
- **6 meses quando:** app publicado, acesso controlado em piloto, relatórios usados na gestão, 2º coworking operando no sistema.
- **Longo prazo:** decisão formal de produto SaaS com roadmap próprio.

---

## Nota metodológica

- Períodos são agrupamentos de prioridade, não compromissos de data.
- Cada item deriva de evidência (ver 17-indice-de-evidencias.md).
- Itens de infraestrutura (VPS, CI/CD, backups) dependem de decisão do dono; itens de produto dependem de validação operacional EWS.
