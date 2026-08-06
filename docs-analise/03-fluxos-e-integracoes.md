# Workeaser — Fluxos e Integrações (03)

> **Data:** 06/08/2026 — Análise 100% read-only
> **Evidência:** [CODIGO] · [INTERFACE] · [BANCO] · [RUNTIME] · [NAO_CONFIRMADO]

---

## 1. Arquitetura de comunicação

```
┌─────────────────┐   HTTP/JSON (axios + SWR)   ┌──────────────────────┐
│ workeaser-      │ ───────────────────────────► │ workeaser-api        │
│ frontend        │ ◄─────────────────────────── │ (AdonisJS 5 :3333)   │
│ (Next.js :3005) │  cookie user-token (Bearer)  └──────────┬───────────┘
└─────────────────┘                                        │
                                                           ▼
┌─────────────────┐   HTTP/JSON                      ┌─────────────┐
│ admin-ui (?)    │ ───────────────────────────────► │ admin-api   │
│                 │  (não há UI dedicada confirmada) │ (:3334)     │
└─────────────────┘                                  └──────┬──────┘
                                                             │
                                        ┌────────────────────┼───────────────────┐
                                        ▼                    ▼                   ▼
                                   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
                                   │  MySQL 8.4   │   │ Integrações  │   │ Webhooks     │
                                   │  (:3307)     │   │ externas     │   │ externos     │
                                   │  108 tabelas │   │ Stripe/Plaid │   │ Stripe/SES/  │
                                   └──────────────┘   │ eSign/WA/etc │   │ Docusign/etc │
                                                       └──────────────┘   └──────────────┘
```

**Frontend → API:** todas as chamadas via axios; token injetado pelo `apiClient` (lê cookie `user-token` via parseCookies) e pelo middleware SWR [CODIGO].

---

## 2. Fluxos principais detalhados

### 2.1 Fluxo de autenticação
1. Usuário acessa /login → preenche Login + Password → POST /api/auth/login
2. API valida (rate limit auth_login) → Hash.verify (argon2id) → verifica email_confirmed → emite token OAT (api_tokens, expira 1 dia)
3. Resposta `{ result: { token, expires_at, user } }` → frontend grava cookie `user-token` (maxAge = expires_at) + header Authorization Bearer
4. Redirect por role: COWORKING/ADMIN → /dashboard; CLIENT → /spaces
5. Páginas protegidas (getServerSideProps + parseCookies) redirecionam /login?expired=true sem token
6. Logout: AuthContext.signOut() → cache.clear() → POST /auth/logout (revoga token) → destroyCookie → /login

### 2.2 Fluxo do operador (dia a dia)
1. Dashboard: métricas (GET /api/cowork/dashboard) [INTERFACE]
2. Quick Actions [INTERFACE]:
   - NEW CUSTOMER → modal → POST /api/cowork/clients
   - CREATE INVOICE → modal → POST /api/cowork/invoices
   - BOOK A MEETING → modal → POST /api/cowork/meetrooms/book
   - BOOK A DAY PASS → modal → POST /api/cowork/day-pass
   - MAILBOX RECEIPT → modal → POST /api/cowork/mailbox
   - ATTACH CONTRACT / DETACH CONTRACT → modais → POST /api/cowork/contracts
3. Gestão por módulo: Locations, Services, Relationship, Finances, Reports, Settings (menu sidebar) [INTERFACE]
4. Cliente detalhe: /relationship/client-management/[id]/ → overview, benefits, products, bookings, invoices, mailbox, support-tickets, contracts
5. Fatura: criar → enviar (resend) → receber pagamento (receivepayment/capturepayment/refundpayment) → pdf (downloadPdf)
6. Contrato: criar → attach documents → sendcontract (eSignature) → status via webhook

### 2.3 Fluxo do cliente (portal)
1. Login (role CLIENT) → /spaces
2. /client/membership → visão da assinatura; abas: benefits-overview, booking-schedule, mailbox-manager, payment-and-invoices, products-and-services [CODIGO]
3. Ações: reservar meeting (POST /api/client/meeting/request), day pass (POST /api/client/day-pass/request ou /visit), ver faturas, caixa postal, convidar membros de equipe (POST /api/client/teams)
4. Pagamento público: invoice-payment/[id] → POST /api/public-invoices/:uuid (sem login) [CODIGO]

### 2.4 Fluxo de pagamento (Stripe)
1. Operador cria fatura (POST /api/cowork/invoices)
2. Cliente paga: (a) página pública (public-invoices/:uuid → pay) ou (b) operador registra pagamento (receivepayment)
3. Capture: se pagamento autorizado mas não capturado → capturepayment
4. Reembolso: refundpayment
5. Webhook Stripe (invoice.paid / payment_failed) sincroniza estado; falhas → DLQ (webhook_dead_letter_queue) → retry task (não roda)
6. ⚠️ Stripe em modo TESTE (sk_test_local) [CODIGO]; 0 faturas/pagamentos reais [BANCO]

### 2.5 Fluxo de assinatura de contrato (eSignature)
1. POST /api/cowork/contracts → cria contrato
2. POST /api/cowork/contracts/:id/attachdocuments → anexa PDFs
3. POST /api/cowork/contracts/:id/sendcontract → envia para assinatura via integração
4. Assinante assina externamente → webhook (docusign/boldsign/adobesign) atualiza status
5. GET /api/cowork/contracts/:id/status → consulta; GET /:id/url → URL pública
6. ⚠️ BoldSign quebrado (Invalid URL) [RUNTIME]; Docusign/AdobeSign com envs placeholder [CODIGO]

### 2.6 Fluxo de onboarding (evento)
1. COWORKING confirma email → evento `user:email_confirmed` dispara (start/events/user.ts)
2. OnboardingEmailService.scheduleSequence enfileira 3 emails (dia 0 welcome, dia 3 dica, dia 7 check-in) na tabela email_queue
3. ProcessEmailQueue task (cada minuto) enviaria via SES — ⚠️ task não roda (scheduler inativo) [CODIGO + RUNTIME]

### 2.7 Fluxo LGPD
1. Usuário pede exclusão (POST /api/me/delete-account) → data_deletion_requests (status requested, scheduled_execution_at)
2. ProcessDataDeletion task (3h diária) processa vencidos — ⚠️ não roda
3. Exportação: GET /api/me/export-data [CODIGO]

### 2.8 Fluxo de banking (Plaid)
1. GET /api/cowork/settings/banking/token → Plaid link token
2. POST /api/cowork/settings/banking → salva bank_accounts
3. POST /api/cowork/banking/:id/sync → sync transações (Plaid)
4. Transações: record/void/note/category
5. PlaidReconciliation task (2h) faria match transação→invoice — ⚠️ não roda
6. ⚠️ envs Plaid placeholder; 0 bank_accounts [BANCO]

### 2.9 Fluxo do admin de plataforma (admin-api)
1. POST /api/auth/login (admin-api) → token partner (partner_api_tokens, 1 dia)
2. GET /api/admin/dashboard → métricas (8, com fallback)
3. GET /api/admin/partners → listar; POST/PUT/DELETE (SYSTEM_DIRECTOR) com proteções (auto-delete bloqueado, ≥1 diretor)
4. GET /api/admin/coworkings|clients → inspeção read-only
5. POST /api/admin/users/:id/suspend|unsuspend → soft delete users.deleted_at
6. Auditoria: admin_audit_logs (event/actor/target/ip/ua/outcome/metadata)

---

## 3. Integrações externas — detalhamento

### 3.1 Stripe (pagamentos)
- **Implementação:** StripeImplementation.ts (385 linhas) — charge, capture, refund, payment methods, customer [CODIGO]
- **Config:** STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET_KEY definidos no env; valor de teste (sk_test_local no .env.docker) [CODIGO]
- **Uso:** InvoicesController (receivePayment, capturePayment, refundPayment, userPaymentMethods); SubscriptionsController (portal-session, cancel, change-plan); StripeConnectController (onboarding, external accounts); Admin/DiscountsController (coupons)
- **Webhook:** POST /api/webhooks/stripe → StripeController.store [CODIGO]
- **Status:** 🟡 código completo; em modo teste; sem uso real

### 3.2 Plaid (banking)
- **Implementação:** PlaidImplementation.ts (185 linhas) — link token, sync [CODIGO]
- **Config:** PLAID_CLIENT_ID placeholder, SECRET redigido [CODIGO]
- **Uso:** BankingController (syncTransactions), SettingsController (generateLinkToken, storeBanking), WalletController (token_link), PlaidReconciliation task
- **Status:** 🔴 código presente; env placeholder; 0 dados

### 3.3 WhatsApp (Meta Cloud API)
- **Implementação:** MetaCloudImplementation.ts (122 linhas) — sendMessage [CODIGO]
- **Uso:** WhatsappController + ProcessWhatsappQueue task (não roda)
- **Webhook:** GET/POST /api/webhooks/whatsapp (verify + store) [CODIGO]
- **Status:** 🟡 implementado; 0 whatsapp_messages [BANCO]; task não roda

### 3.4 AWS SES (email)
- **Implementação:** fila email_queue + ProcessEmailQueue task; envs SES_MAIL_FROM=noreply... [CODIGO]
- **Webhook:** POST /api/webhooks/ses (bounce/complaint) [CODIGO]
- **Status:** 🟡 implementado; AWS creds local-dev; task não roda

### 3.5 eSignature (Docusign / AdobeSign / BoldSign)
- **Docusign:** ESignature/Implementation/DocusignImplementation.ts (159 linhas) — auth + envelopes [CODIGO]; envs placeholder; DOCUSIGN_SANDBOX=true [CODIGO]
- **AdobeSign:** AdobeSignImplementation.ts (82 linhas) [CODIGO]; ADOBE_SIGN_API configurado
- **BoldSign:** BoldSign.impl.ts (250 linhas) [CODIGO]; **QUEBRADO em runtime** — GET /api/cowork/boldsign/identities/me retorna TypeError Invalid URL (base URL relativa sem host) [RUNTIME — docker logs 23/07]
- **Webhooks:** docusign POST, boldsign POST (+middleware boldsignValidation), adobesign GET/POST [CODIGO]
- **Status:** 🔴 parcial — BoldSign quebrado; Docusign sem creds reais

### 3.6 Calendários (Google / Exchange)
- Google: AuthGoogleController redirect/callback (OAuth) [CODIGO]; GOOGLE_CLIENT_ID placeholder
- Exchange: AuthExchangeController redirect/callback [CODIGO]; EXCHANGE_CLIENT_ID placeholder
- CalendarIntegrationsController: list/delete [CODIGO]
- **Status:** 🟡 código presente; sem creds reais; 0 calendar_integrations [BANCO]

### 3.7 Mapbox
- Env NEXT_PUBLIC_MAPBOX_KEY / MAPBOX_API_KEY (pk.local...) [CODIGO]; serviço src/services/map [CODIGO]
- **Status:** 🟡 chave local de teste

### 3.8 QBO (QuickBooks)
- **NÃO é integração do sistema.** Os 240 clientes foram importados numa carga única pelo script `import-qbo-customers.py` (backup em backups/workeaser-orlando-2026-07-23/) [BANCO + memória]
- **Status:** ⚪ sem integração contínua; importação pontual concluída

---

## 4. Automações e processos em background

| Automação | Mecanismo | Roda? | Evidência |
|---|---|---|---|
| Geração de faturas recorrentes | GenerateInvoice task (0 2 * * *) | ❌ NÃO | [RUNTIME] |
| Faturas vencidas | OverdueInvoice task (0 5 * * * *) | ❌ NÃO | [RUNTIME] |
| Reconciliação bancária | PlaidReconciliation (0 */2 * * *) | ❌ NÃO | [RUNTIME] |
| LGPD | ProcessDataDeletion (0 3 * * *) | ❌ NÃO | [RUNTIME] |
| Fila de emails | ProcessEmailQueue (* * * * *) | ❌ NÃO | [RUNTIME] |
| Retry de webhooks | ProcessWebhookRetryQueue (*/5 * * * *) | ❌ NÃO | [RUNTIME] |
| Fila WhatsApp | ProcessWhatsappQueue (* * * * *) | ❌ NÃO | [RUNTIME] |
| Renovação de contratos | RenewContractTask (0 1 * * *) | ❌ NÃO | [RUNTIME] |
| Onboarding 3 emails | evento user:email_confirmed → email_queue | Parcial (enfileira; envio não roda) | [CODIGO] |
| Auditoria de ações | LoggerMiddleware → logs | ✅ SIM | [BANCO — 150 registros] |
| Auditoria admin | AdminAuditService → admin_audit_logs | ✅ SIM (fire-and-forget) | [CODIGO] |

**Causa raiz [RUNTIME]:** adonis5-scheduler exige `node ace scheduler:run` como processo separado; o container roda somente `node server.js` (PID 1 = tini → node server.js; nenhum processo scheduler). As 8 tasks jamais executam no ambiente atual.

---

## 5. Webhooks (endpoints públicos)

| Endpoint | Middleware | Eventos tratados | Status |
|---|---|---|---|
| GET/POST /api/webhooks/adobesign | — | validação + eventos | 🟡 |
| POST /api/webhooks/boldsign | boldsignValidation | eventos BoldSign | 🔴 (integ. quebrada) |
| POST /api/webhooks/docusign | — | eventos Docusign | 🟡 |
| POST /api/webhooks/ses | — | bounce/complaint | 🟡 |
| POST /api/webhooks/stripe | — | invoice.* | 🟡 |
| GET/POST /api/webhooks/whatsapp | — | verificação + mensagens | 🟡 |

Falhas de webhook → `webhook_dead_letter_queue` (DLQ) → Admin/WebhookDLQController (stats, show, retry, discard) [CODIGO]; 0 na fila [BANCO]; retry task não roda [RUNTIME].
