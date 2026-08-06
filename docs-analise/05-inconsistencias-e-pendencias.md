# Workeaser — Inconsistências e Pendências (05)

> **Data:** 06/08/2026 — Análise 100% read-only
> **Evidência:** [CODIGO] · [INTERFACE] · [BANCO] · [RUNTIME] · [NAO_CONFIRMADO]

---

## 1. Problemas críticos (bloqueiam uso real)

### 1.1 Scheduler de tasks NÃO está rodando [RUNTIME]
- As 8 tasks (GenerateInvoice, OverdueInvoice, PlaidReconciliation, ProcessDataDeletion, ProcessEmailQueue, ProcessWebhookRetryQueue, ProcessWhatsappQueue, RenewContractTask) estão definidas com cron via adonis5-scheduler [CODIGO]
- O container roda apenas `node server.js` (verificado via /proc: PID 1 = tini → node server.js; nenhum processo `ace scheduler:run`) [RUNTIME]
- **Consequência:** nenhuma automação de background executa: faturas não são geradas, emails não saem da fila, webhooks não são retentados, LGPD não processa
- **Correção necessária:** subir um processo `node ace scheduler:run` (ou container separado) no compose

### 1.2 Integração BoldSign quebrada [RUNTIME]
- GET /api/cowork/boldsign/identities/me → `TypeError: Invalid URL` (base URL relativa `/v1-beta/...` sem host) — registrado repetidamente nos docker logs (23/07)
- **Consequência:** módulo de assinatura BoldSign não funciona
- **Correção:** configurar base URL da API BoldSign no env/código da integração

### 1.3 Stripe em modo teste + sem dados [CODIGO + BANCO]
- STRIPE_SECRET_KEY = sk_test_local (modo teste) [CODIGO]
- 0 invoices, 0 payments, 0 subscriptions [BANCO]
- Nenhum fluxo de dinheiro real aconteceu ainda

### 1.4 Credenciais placeholder nas integrações [CODIGO]
- GOOGLE_CLIENT_ID/SECRET = placeholder → OAuth Google/calendário não funciona
- DOCUSIGN_INTEGRATION_KEY/USER_ID = placeholder → Docusign não autentica
- PLAID_CLIENT_ID = placeholder → Plaid não conecta
- EXCHANGE_CLIENT_ID = placeholder → Exchange não conecta
- AWS creds = local-dev → SES não envia email real

---

## 2. Inconsistências de dados [BANCO]

### 2.1 Preço de meetrooms em unidades diferentes
- BB-8/C-3PO/R2-D2: price = **5500** (parece centavos)
- The Empire - Training Room: **350**; Jedi Council - Conference Hall: **800** (parecem dólares)
- Unidade inconsistente entre registros da mesma tabela

### 2.2 Emails compostos com vírgula (~20 clientes)
- Ex.: `medstation.adm@gmail.com, finance@brazilianclinic.com`
- Herança da importação QBO (campo company_email com múltiplos emails)
- Quebram validação de email no login: `VALIDATION_ERROR "The email is not valid"` (testado)
- Clientes afetados NÃO conseguem logar, mesmo com senha correta

### 2.3 Contagens: users 244 vs client_accounts 240 vs cowork_clients 240
- users: 5 ADMIN + 1 COWORKING + 238 CLIENT = 244
- client_accounts: 240 (inclui Acme)
- cowork_clients: 240 (user_id 3..242)
- Fecham aritmeticamente, mas o vínculo users↔client_accounts é frouxo (sem FK; por email/ordem de importação)

### 2.4 Virtual offices todos na location 4 (Unit Saturn)
- Os 7 planos VO estão todos em Saturn; outras 9 unidades sem produtos vendáveis cadastrados

### 2.5 rooms vazia com room_prices preenchida
- 0 rooms, mas 3 room_prices

### 2.6 addresses.fulltext/fulltext2
- Duplicação aparente de colunas; `fulltext` é palavra reservada MySQL (dificulta queries)

### 2.7 FKs: apenas 7 constraints
- Relações quase todas lógicas via ORM — risco de integridade em operações diretas no banco

---

## 3. Funcionalidades duplicadas / abandonadas / legado [CODIGO]

1. **Membership duplicado:** `client/membership/[id]/...` vs `membership/[id]/...` — dois conjuntos de páginas para o mesmo recurso
2. **client/team.ts:** rota GET / registrada 2x (listInvites + index)
3. **SilentAuth (admin-api):** middleware morto (não registrado, não usado)
4. **Model Location (admin-api):** sem uso (dashboard usa query crua)
5. **Landing `/`:** chaves localStorage legadas (workeaser.token/token) não usadas pelo fluxo atual
6. **AuthController.import:** rota sem middleware, endpoint de criação em massa exposto
7. **Enum auditoria admin:** eventos client/cowork create/update/delete nunca emitidos
8. **DealsOpportunities:** comentário "// to do" — rota GET /:id com intenção incompleta
9. **Cookie user-token sem httpOnly** (linha comentada) — risco XSS; divergente de comentário no InvoiceOptions
10. **81 tabelas vazias** — estrutura completa nunca usada (invoices, contracts, meetings, payments, leads, teams, banking, taxes, discounts, chat, mailboxes, tours, day_passes...)
11. **admin-api ORFÃO:** as páginas admin do FRONTEND (`/admin/audit-logs`, `/admin/discounts`, `/admin/subscriptions/metrics`, `/admin/webhook-dlq`) chamam o **workeaser-api** (porta 3333), onde esses endpoints existem — NÃO chamam o admin-api. O admin-api (partners/clients/dashboard, porta 3334) é hoje uma superfície sem consumidor localizado no frontend [CODIGO — grep cruzado frontend×admin-api]
12. **Página `/client` vazia:** apenas `<Head>` "My Membership" [CODIGO]
13. **Link "/signup" quebrado:** landing aponta para `/signup` (inexistente; rota real é `/create-account`) [CODIGO]
14. **Endpoint inconsistente:** frontend `getTax` → `GET /cowork/Taxs` (maiúscula) vs rota real `/cowork/taxes` [CODIGO]
15. **Feature flags:** LEADS_FEATURE gate; Omnichat e Marketplace/Community/My Membership comentados no código [CODIGO]

---

## 4. Pendências de robustez (do council 27/07 e 04/08)

1. **Credenciais placeholder** = sistema aberto (PII de 240 clientes) — AÇÃO #1 do council
2. **Sem produção:** roda só no PC local (single point of failure — Windows Update/Docker restart derruba tudo)
3. **Sem backup offsite** (backup local existe em A:\Claude-Deep\backups)
4. **Sem CI/CD, sem testes** (admin-api tem tests/functional; workeaser-api não confirmado)
5. **Sem domínio/SSL** (http://localhost)
6. **240 clientes importados mas sistema nunca usado** ("cathedral sem congregação" — council 27/07)
7. **CRM trycompai/crm:** council 04/08 decidiu que está FORA do caminho de robustez
8. **Ambiente de testes:** NODE_ENV testing para seed (pino-pretty ausente em development)
9. **E-mails de clientes compostos** precisam normalização para login funcionar
10. **Senhas:** troca geral feita em 06/08 (argon2id); clientes com senha padrão T$irUP8ddMkPz7JK — pendente política de troca/distribuição

---

## 5. Limitações da análise

- **Frontend:** páginas analisadas por código; apenas dashboard/login confirmados visualmente em navegador (admin logado)
- **Fluxos de exclusão/edição:** soft delete confirmado no código; UI exata de confirmação não verificada em todas as telas
- **Commissions/Payouts:** tela existe; backend específico não identificado — [NAO_CONFIRMADO]
- **Páginas avulsas** (status, contact, privacy, terms, marketplace, automations, onboarding): existência confirmada; conteúdo renderizado não lido em todas
- **admin-api UI:** nenhuma UI dedicada encontrada no frontend — acesso via API apenas [NAO_CONFIRMADO]
- **Testes:** tests/functional do admin-api lidos pelo subagente; cobertura do workeaser-api não confirmada
- **Valores de env:** redigidos (segredos); presença/ausência de placeholders confirmada
- **Logs:** erros de BoldSign confirmados em logs antigos (23/07); logs atuais mostram apenas LOGIN_SUCCESS das sessões de 06/08

---

## 6. Matriz final (Função | Interface | Backend | Banco | Funcionamento)

| Função | Existe na interface | Existe no backend | Banco identificado | Funcionamento confirmado | Observações |
|---|---|---|---|---|---|
| Login | ✅ /login | ✅ POST /auth/login | ✅ api_tokens, logs | ✅ testado | cookie sem httpOnly |
| Signup | ✅ "Criar conta grátis" | ✅ POST /auth/signup | ✅ users | ✅ código | — |
| 2FA | ✅ settings/security/2fa | ✅ /me/2fa/* | ✅ user (campos) | 🟡 sem uso | — |
| LGPD | ✅ settings/privacy | ✅ /me/delete-account, export-data | ✅ data_deletion_requests | 🟡 task não roda | — |
| Dashboard | ✅ /dashboard | ✅ /cowork/dashboard | ✅ agrega | ✅ visto | métricas de catálogo |
| Locations CRUD | ✅ /locations/* | ✅ /cowork/locations | ✅ 10 registros | ✅ CRUD | sem operações vinculadas |
| Services | ✅ /services/* | ✅ /infos/services | ✅ 4 registros | ✅ | catálogo |
| Virtual Office | ✅ /services/virtual-office | ✅ /cowork/virtual-offices | ✅ 7 planos | ✅ catálogo | todos em Saturn |
| Meeting Room | ✅ /services/meeting-room | ✅ /cowork/meetrooms | ✅ 5 salas | 🟡 catálogo; 0 reservas | preço 5500 inconsistente |
| Open Desk | ✅ /services/open-desks | ✅ /cowork/desks | ✅ 4 mesas | 🟡 | — |
| Private Room | ✅ /services/private-rooms | ✅ /cowork/rooms | ✅ room_prices (3) | ⚪ 0 rooms | — |
| Clientes CRUD | ✅ client-management | ✅ /cowork/clients | ✅ 240 | ✅ CRUD | emails compostos quebram login |
| Import/export clientes | ✅ import | ✅ /clients/import, /export | ✅ usado na carga QBO | ✅ | — |
| Invoices | ✅ /finances/invoices | ✅ /cowork/invoices | ✅ 0 | 🔴 sem dados | código completo |
| Pagamento Stripe | ✅ tela fatura | ✅ receive/capture/refund | ✅ 0 | 🔴 sem dados | modo teste |
| Invoice pública | ✅ /invoice-payment/[id] | ✅ /public-invoices/:uuid | ✅ 0 | 🔴 sem dados | — |
| Contracts | ✅ ATTACH/DETACH | ✅ /cowork/contracts | ✅ 0 | 🔴 sem dados | eSignature quebrado |
| Meetings | ✅ BOOK A MEETING | ✅ /meetrooms/book | ✅ 0 | 🔴 sem dados | — |
| Day Pass | ✅ BOOK A DAY PASS | ✅ /day-pass | ✅ 0 | 🔴 sem dados | — |
| Mailbox | ✅ MAILBOX RECEIPT | ✅ /mailbox | ✅ 0 | 🔴 sem dados | — |
| Leads/Pipeline | ✅ lead-management | ✅ /sales-pipeline, /deals | ✅ 0 | 🔴 sem dados | — |
| Banking/Plaid | ✅ /finances/banking | ✅ /banking, /settings/banking | ✅ 0 | 🔴 sem dados | env placeholder |
| Subscriptions | ✅ /settings/subscriptions | ✅ /cowork/subscriptions | ✅ 3 planos, 0 assinaturas | 🔴 sem dados | Stripe teste |
| Taxes | ✅ /finances/taxes | ✅ /cowork/taxes | ✅ 0 | 🔴 sem dados | — |
| Reports | ✅ /reports | ✅ /cowork/reports (10) | ✅ 0 | 🔴 sem dados | — |
| Chat | ✅ /relationship/omnichat | ✅ /cowork/chats, /client/chats | ✅ 0 | 🔴 sem dados | — |
| Teams/Employees | ✅ settings/members | ✅ /employees, /teams | ✅ 0 | 🔴 sem dados | — |
| Tasks background | ❌ (sem UI) | ✅ app/Tasks (8) | ✅ email_queue etc. | 🔴 NÃO roda | scheduler inativo |
| Webhooks | ❌ (sem UI) | ✅ /api/webhooks/* | ✅ DLQ | 🟡 | BoldSign quebrado |
| Admin partners | ❌ (sem UI) | ✅ admin-api /partners | ✅ 0 | 🟡 | API-only |
| Admin suspender user | ❌ (sem UI) | ✅ admin-api /users/:id/suspend | ✅ users.deleted_at | ✅ código | soft delete |
| Admin audit | ❌ (sem UI) | ✅ admin-api audit | ✅ admin_audit_logs (0) | 🟡 | — |
| Discounts | ✅ /admin/discounts | ✅ /admin/discounts | ✅ 0 | 🔴 sem dados | — |
| Webhook DLQ admin | ✅ /admin/webhook-dlq | ✅ /admin/webhook-dlq | ✅ 0 | 🟡 | retry não roda |
| Notificações | ✅ (ícone sino) | ✅ /notifications | ✅ 0 | 🟡 | — |
| Photos/Videos/Docs | ✅ upload | ✅ /photos, /videos, /documents | ✅ photos 28 | 🟡 | seed |
| Onboarding emails | ❌ (evento) | ✅ evento user:email_confirmed | ✅ email_queue (0) | 🔴 task não roda | — |
| Stripe Connect | ❌ | ✅ /stripe-connect | ✅ 0 | 🔴 sem dados | — |
| Calendários G/Exchange | ✅ settings/integrations | ✅ /calendar-integrations | ✅ 0 | 🔴 sem dados | env placeholder |
