# Workeaser — Integrações Externas (08)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] · [CONFIG] · [RUNTIME] · [NAO_CONFIRMADO]
> **Segredos:** valores de credenciais NÃO são expostos neste documento.

---

## 1. Resumo geral

| Integração | Finalidade | Implementação | Credencial | Status runtime |
|---|---|---|---|---|
| Stripe | Pagamentos, subscriptions, connect | StripeImplementation.ts (385 linhas) | sk_test (TESTE) | 🟡 código OK, sem uso real |
| Plaid | Banking/reconciliação | PlaidImplementation.ts (185 linhas) | placeholder | 🔴 sem creds reais |
| WhatsApp Meta Cloud | Mensagens | MetaCloudImplementation.ts (122 linhas) | — | 🟡 código OK |
| AWS SES | Email (fila) | email_queue + ProcessEmailQueue | local-dev | 🔴 task não roda |
| Docusign | eSignature | DocusignImplementation.ts (159 linhas) | placeholder (sandbox) | 🔴 sem creds reais |
| AdobeSign | eSignature | AdobeSignImplementation.ts (82 linhas) | configurado | 🟡 (legado segundo subagente) |
| BoldSign | eSignature | BoldSign.impl.ts (250 linhas) | — | ❌ QUEBRADA (Invalid URL) |
| Google Calendar | Calendário | AuthGoogleController | placeholder | 🔴 sem creds reais |
| Exchange (MS Graph) | Calendário | AuthExchangeController | placeholder | 🔴 sem creds reais |
| Mapbox | Mapas | src/services/map + env | pk.local | 🟡 chave local |

## 2. Detalhamento por integração

### 2.1 Stripe
- **Arquivos:** app/Integrations/Payments/Implementation/StripeImplementation.ts; InvoicesController; SubscriptionsController; StripeConnectController; StripeSubscriptionService; StripeConnectService; Admin/DiscountsController [CODIGO]
- **Autenticação:** STRIPE_SECRET_KEY (env) [CONFIG]
- **Operações:** charge, capture, refund, payment methods, customer, billing portal, subscriptions, connect onboarding/external accounts, coupons [CODIGO]
- **Webhook:** POST /api/webhooks/stripe — valida com `stripe.webhooks.constructEvent` + timestamp/nonce anti-replay [CODIGO]
- **Falhas:** eventos falhos → webhook_dead_letter_queue → retry task (NÃO roda) [CODIGO + RUNTIME]
- **Sandbox:** sk_test_local [CONFIG]
- **Idempotência:** não confirmada [NAO_CONFIRMADO]
- **Reconciliação:** PlaidReconciliation task (não roda) [CODIGO]

### 2.2 Plaid
- **Arquivos:** PlaidImplementation.ts; BankingController; SettingsController (banking/token); WalletController [CODIGO]
- **Autenticação:** PLAID_CLIENT_ID (placeholder), PLAID_SECRET [CONFIG]
- **Operações:** link token, sync transactions [CODIGO]
- **Falhas:** 0 dados; sem teste em runtime [BANCO]

### 2.3 WhatsApp Meta Cloud
- **Arquivos:** MetaCloudImplementation.ts; WhatsappController; ProcessWhatsappQueue task [CODIGO]
- **Operações:** sendMessage (retorna msgId) [CODIGO]
- **Webhook:** GET (verify hub.challenge com WHATSAPP_META_VERIFY_TOKEN) + POST (HMAC X-Hub-Signature-256) [CODIGO]
- **Fila:** whatsapp_messages (vazia); task não roda [BANCO + RUNTIME]

### 2.4 AWS SES
- **Arquivos:** email_queue + ProcessEmailQueue task; SesController webhook [CODIGO]
- **Autenticação:** AWS_ACCESS_KEY/SECRET (local-dev) [CONFIG]
- **Webhook:** POST /api/webhooks/ses — anti-replay por SNS MessageId [CODIGO]
- **Fila:** email_queue (vazia); task não roda [BANCO + RUNTIME]

### 2.5 Docusign
- **Arquivos:** DocusignImplementation.ts; DocusignController webhook [CODIGO]
- **Autenticação:** DOCUSIGN_INTEGRATION_KEY/USER_ID (placeholder), DOCUSIGN_SANDBOX=true [CONFIG]
- **Webhook:** POST /api/webhooks/docusign — valida header X-ADOBESIGN-CLIENTID [CODIGO]

### 2.6 AdobeSign
- **Arquivos:** AdobeSignImplementation.ts (82 linhas); AdobeSignController webhook [CODIGO]
- **Autenticação:** ADOBE_SIGN_API, AUTHORIZATION_ADOBE_SIGN, CLIENTID_ADOBE_SIGN [CONFIG]
- **Status:** parcial; subagente apontou como "legado, desativado" [CODIGO]

### 2.7 BoldSign ❌
- **Arquivos:** BoldSign.impl.ts (250 linhas); BoldSignsController; BoldSignController webhook + middleware boldsignValidation [CODIGO]
- **Problema RUNTIME:** `GET /api/cowork/boldsign/identities/me` → `TypeError: Invalid URL` (base URL relativa `/v1-beta/...` sem host) — registrado nos docker logs 23/07 [RUNTIME]
- **Webhook:** POST /api/webhooks/boldsign — HMAC x-boldsign-signature [CODIGO]

### 2.8 Google Calendar
- **Arquivos:** AuthGoogleController (redirect/callback), CalendarIntegrationsController [CODIGO]
- **Autenticação:** GOOGLE_CLIENT_ID/SECRET (placeholder) [CONFIG]
- **Dados:** calendar_integrations (vazia) [BANCO]

### 2.9 Exchange (Microsoft Graph)
- **Arquivos:** AuthExchangeController (redirect/callback) [CODIGO]
- **Autenticação:** EXCHANGE_CLIENT_ID (placeholder), EXCHANGE_AUTHORITY [CONFIG]

### 2.10 Mapbox
- **Arquivo:** src/services/map/index.ts; env NEXT_PUBLIC_MAPBOX_KEY [CODIGO + CONFIG]

## 3. Padrões transversais

| Aspecto | Situação | Evidência |
|---|---|---|
| Retry de webhooks | DLQ + ProcessWebhookRetryQueue (5min) — NÃO roda | [CODIGO + RUNTIME] |
| Timeout de chamadas externas | Não verificado | [NAO_CONFIRMADO] |
| Rate limit externo | Não identificado | [NAO_CONFIRMADO] |
| Logs de integração | Logger do Adonis (pino) + logs table | [CODIGO + RUNTIME] |
| Armazenamento de credenciais | Env files (env-pc/*.env, .env.docker) — fora do git? [NAO_CONFIRMADO] | [CONFIG] |
| Duplicidade/idempotência | Stripe webhook tem nonce anti-replay; demais não confirmados | [CODIGO] |
| Comportamento quando serviço indisponível | AppError com status do provedor; sem fallback | [CODIGO — AppError] |
| Reconciliação | PlaidReconciliation task (não roda) | [CODIGO] |
