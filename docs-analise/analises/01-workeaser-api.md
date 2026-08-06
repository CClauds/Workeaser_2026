# Análise Técnica — Workeaser API (AdonisJS 5)

> **Sistema:** Workeaser (gestão de coworking)
> **Componente:** `workeaser-api` — API principal (frontend Web + app do cliente)
> **Código-fonte:** `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\src\workeaser-api\workeaser-management-api-main\`
> **Stack:** AdonisJS 5 (Core ^5.9) + Lucid ORM (Lucid ^18) + Auth OAT + MySQL 8.4 + Bouncer (permissões) + adonis5-scheduler + Drive S3
> **Container:** `workeaser-api` — porta 3333 — `node server.js` via tini
> **Evidência:** leitura direta do código-fonte (modo read-only). Marcações: [CODIGO] = confirmado no código; [INTERFACE] = confirmado em tela; [NAO_CONFIRMADO] = não foi possível confirmar.

---

## 1. Mapa de rotas completo

Prefixo raiz: `/api`. Middlewares nomeados (start/kernel.ts): `auth`, `silentAuth`, `coworkAuthorization`, `clientAuthorization`, `adminAuthorization`, `boldsignValidation`, `rateLimit` [CODIGO].

**Autorização por módulo (coworkAuthorization):** as rotas de cowork são protegidas por módulo via `coworkAuthorization:${CoworkModulesEnum.X}` — os módulos (tabela cowork_modules) são: LOCATIONS, SERVICES, RELATIONSHIP, FINANCES, REPORTS, ACCOUNT_SETTINGS (mais MEETROOM no middleware de meetrooms) [CODIGO — extraído por regex dos arquivos de rota].

### 1.1 Públicas / gerais

| Método | Rota | Controller@action | Middleware | Área |
|---|---|---|---|---|
| POST | /api/auth/login | AuthController.login | rateLimit:auth_login | Público |
| POST | /api/auth/signup | AuthController.store | rateLimit:auth_signup | Público |
| POST | /api/auth/logout | AuthController.logout | rateLimit:auth_login | Público |
| POST | /api/auth/email-confirmation | AuthController.emailConfirmation | rateLimit:auth_resend | Público |
| POST | /api/auth/resend-email-confirmation | AuthController.resendEmailConfirmation | rateLimit:auth_resend | Público |
| POST | /api/auth/lost-password | AuthController.lostPassword | rateLimit:auth_forgot | Público |
| POST | /api/auth/lost-password-confirmation | AuthController.lostPasswordConfirmation | rateLimit:auth_forgot | Público |
| POST | /api/auth/import | AuthController.import | — | Interno |
| GET | /api/me | MeController.show | auth | Logado |
| PUT | /api/me | MeController.update | auth | Logado |
| POST | /api/me/delete-account | Me/AccountDeletionController.createRequest | auth | Logado |
| GET | /api/me/delete-account | Me/AccountDeletionController.listRequests | auth | Logado |
| DELETE | /api/me/delete-account/:id | Me/AccountDeletionController.cancelRequest | auth | Logado |
| GET | /api/me/export-data | Me/AccountDeletionController.exportData | auth | Logado |
| GET | /api/me/2fa | Me/TwoFactorController.status | auth | Logado |
| POST | /api/me/2fa/setup | Me/TwoFactorController.setup | auth | Logado |
| POST | /api/me/2fa/verify | Me/TwoFactorController.verify | auth | Logado |
| POST | /api/me/2fa/disable | Me/TwoFactorController.disable | auth | Logado |
| GET | /api/notifications | NotificationsController.show | auth | Logado |
| GET | /api/notifications/count | NotificationsController.count | auth | Logado |
| POST | /api/notifications/read-all | NotificationsController.markAllAsRead | auth | Logado |
| POST | /api/notifications/:id/read | NotificationsController.markAsRead | auth | Logado |
| DELETE | /api/notifications/:id | NotificationsController.delete | auth | Logado |
| GET | /api/photos/* | PhotosController.show | — | Público |
| POST | /api/photos | PhotosController.store | auth | Logado |
| DELETE | /api/photos/* | PhotosController.delete | auth | Logado |
| GET | /api/videos/* | VideosController.show | — | Público |
| POST | /api/videos | VideosController.store | auth | Logado |
| DELETE | /api/videos/* | VideosController.delete | auth | Logado |
| GET | /api/documents/* | DocumentsController.show | — | Público |
| POST | /api/documents | DocumentsController.store | auth | Logado |
| DELETE | /api/documents/* | DocumentsController.delete | auth | Logado |
| GET | /api/wallet/token_link | WalletController.generateTokenLink | silentAuth | Parcial |
| GET/POST/PUT/DELETE | /api/wallet/:payment_type(/:id) | WalletController | auth | Logado |
| GET | /api/infos/amenities | Utils/AmenitiesController.index | — | Público |
| GET | /api/infos/services | Utils/ServicesController.index | — | Público |
| GET | /api/infos/taxtypes | Utils/TaxTypesController.index | — | Público |
| GET | /api/infos/termsizes | Utils/ContractTermSizeController.index | — | Público |
| GET | /api/infos/meetroomquestions | Utils/MeetroomQuestionsController.index | — | Público |
| GET | /api/spaces | SpacesController.list | — | Público |
| GET | /api/spaces/:id | SpacesController.showLocation | — | Público |
| GET | /api/spaces/:serviceType/:id | SpacesController.show | — | Público |
| GET | /api/spaces/vo/:slug | SpacesController.showVoBySlug | — | Público |
| GET | /api/spaces/mr/:slug | SpacesController.showMrBySlug | — | Público |
| GET | /api/spaces/od/:slug | SpacesController.showOdBySlug | — | Público |
| GET | /api/spaces/pr/:slug | SpacesController.showPrBySlug | — | Público |
| GET | /api/public-invoices/checkinvoices | PublicInvoicesController.checkInvoices | — | Público |
| GET | /api/public-invoices/:uuid | PublicInvoicesController.show | — | Público |
| POST | /api/public-invoices/:uuid | PublicInvoicesController.pay | — | Público |
| GET | /api/public-invoices/:uuid/pdf | PublicInvoicesController.generatePdf | — | Público |
| GET | /health, /health/db, /health/version | inline | — | Healthcheck |
| GET | / | { message: 'Workeaser - API' } | — | Raiz |

(prefixo de publicInvoices: arquivo usa `Route.group` sem prefix explícito visível no grep — caminho exato em routes/publicInvoices.ts [CODIGO])

### 1.2 Rotas Cowork (operador — exige `auth` + `coworkAuthorization`)

**Prefixos reais e módulos de acesso** [CODIGO — regex nos arquivos de rota]:

| Arquivo de rota | Módulo de acesso | Prefixo real | Ações |
|---|---|---|---|
| banking.ts | FINANCES | api/cowork/finance/banking | list, showTransaction, recordTransaction, voidTransaction, addNote, changeCategory, syncTransactions |
| boldsign.ts | ACCOUNT_SETTINGS | api/cowork/boldsign | CreateIdentity, ResendIdentity, ResendRevokedIdentity, GetIdentity |
| bookingsandagenda.ts | RELATIONSHIP | api/cowork/relationship/bookings | unapproved, scheduled |
| calendarintegrations.ts | ACCOUNT_SETTINGS | api/cowork/settings/calendar | list, delete + redirects Google/Exchange |
| chats.ts | RELATIONSHIP | api/cowork/chats | index, firstOrCreateChat, lastMessages, showChatMessages, newMessage |
| clients.ts | RELATIONSHIP | api/cowork/clients | CRUD + search, export, import, importSimple, accountMembers, overview, productsAndServices, benefits, bookings, invoices, mailbox |
| contracts.ts | RELATIONSHIP | api/cowork/relationship/contracts | CRUD + pdf, detach, attachNewDocuments, getContracts, getContractCancelInfo, sendContract, calculateService, contractUrlCowork, getContractStatus |
| dashboard.ts | auth (sem módulo) | api/cowork/dashboard | mainDashboard, locationsDashboard, servicesDashboard, relationshipDashboard, financesDashboard |
| daypass.ts | RELATIONSHIP | api/cowork/relationship/daypass | CRUD + approve, reject |
| dealsopportunities.ts | RELATIONSHIP | api/cowork/relationship/dealsopportunities | index, show, approve, reject |
| desks.ts | LOCATIONS | api/cowork/desks | CRUD + export, import, changeSearchAvailability |
| employees.ts | ACCOUNT_SETTINGS | api/cowork/employees (invites) | convites + CRUD |
| invoices.ts | FINANCES | api/cowork/finance/invoices | CRUD + info, resend, receivePayment, capturePayment, refundPayment, userPaymentMethods, downloadPdf |
| locations.ts | LOCATIONS | api/cowork/locations | CRUD + export, import |
| mailbox.ts | RELATIONSHIP | api/cowork/relationship/mailbox | CRUD |
| meetrooms.ts | MEETROOM | api/cowork/meetrooms | CRUD + book, approve, reject, import, changeSearchAvailability |
| personasmanagement.ts | RELATIONSHIP | api/cowork/relationship/personasmanagement | CRUD |
| reports.ts | REPORTS | api/cowork/reports | approvedBookings, contractRenewals, dayPassesListing, invoicesOverview, leadsListing, membersListing, transactionHistory/:linkedBankAccountId, revenueByLocation, revenueByMember, visitorsListing |
| rooms.ts | LOCATIONS | api/cowork/rooms | CRUD + import, changeSearchAvailability |
| salespipeline.ts | RELATIONSHIP | api/cowork/relationship/salespipeline | CRUD + updateStatus |
| search.ts | auth (sem módulo) | api/cowork/search | searchUser, getClientDetails, getLeadDetails |
| settings.ts | ACCOUNT_SETTINGS | api/cowork/settings | subscriptions, global, banking |
| status.ts | — | api/cowork/status | index, update |
| stripeconnect.ts | — | api/cowork/stripe-connect | onboardingurl, externalaccount |
| subscriptions.ts | — | api/cowork/subscriptions | plans, CRUD, portal-session, cancel, sync, change-plan, extend-trial-self-service, validate-discount |
| taxes.ts | — | api/cowork/taxes | CRUD |
| tour.ts | RELATIONSHIP | api/cowork/relationship/tour (provável) | CRUD + approve, reject |
| virtualoffices.ts | — | api/cowork/virtualoffices | CRUD + export, import, changeavailability |
| authExchange.ts | público | api/exchange/callback | callback |
| authGoogle.ts | público | api/google/callback | callback |

**Nota:** `api/cowork/subscriptions/validate-discount` é rota pública com só `auth` (cliente valida cupom antes de assinar) [CODIGO].

### 1.3 Rotas Client (membro — exige `auth` + `clientAuthorization`)

| Rota (sob /api/client) | Controller | Ações |
|---|---|---|
| /chats | ChatController | Chat do cliente |
| /contract/:id/url | ContractController | URL do contrato |
| /day-pass/request, /visit | DayPassController | Day pass do cliente |
| /invoices (index, show) | InvoicesController | Faturas do cliente |
| /mailbox (index, show, update) | MailboxesController | Caixa postal |
| /meeting (list, show, request, cancel) | MeetingController | Reservas de reunião |
| /membership (list, show, services, bookings, mailbox, invoices) | MyMembershipController | Minha assinatura |
| /spaces/tours, /reserve | SpacesController / ToursController | Reservas |
| /teams (invites + CRUD) | TeamMembersController | Equipe |

### 1.4 Rotas Admin (exige `auth` + `adminAuthorization`)

| Rota | Controller | Ações |
|---|---|---|
| POST /api/admin/auth/admin | Admin/AuthController.login | Login admin |
| GET /api/admin/audit-logs (stats, :id, index) | Admin/AuditLogController | Auditoria |
| GET/POST /api/admin/discounts, POST /:id/deactivate, GET /validate-discount | Admin/DiscountsController | Descontos |
| GET /api/admin/subscriptions/metrics, /cohorts, POST /:id/extend-trial, GET /:cowork_account_id | Admin/SubscriptionsController | Métricas de assinatura |
| GET /api/admin/webhook-dlq (stats, :id, retry, discard, index) | Admin/WebhookDLQController | DLQ de webhooks |

### 1.5 Webhooks (públicos, validados por assinatura)

| Rota | Controller | Eventos |
|---|---|---|
| GET/POST /api/webhooks/adobesign | AdobeSignController | validação + eventos AdobeSign |
| POST /api/webhooks/boldsign | BoldSignController | eventos BoldSign |
| POST /api/webhooks/docusign | DocusignController | eventos Docusign |
| POST /api/webhooks/ses | SesController | bounce/complaint SES |
| POST /api/webhooks/stripe | StripeController | invoice.paid, payment_failed, etc. |
| GET/POST /api/webhooks/whatsapp | WhatsappController | verificação + mensagens Meta |

---

## 2. Controllers por área — resumo do que executam

### 2.1 Autenticação e Me
- **AuthController** [CODIGO]: login (verifica hash argon2 via Adonis Hash, emite bearer token OAT), signup (cria user + valida role), logout, emailConfirmation (ativa conta via token), resendEmailConfirmation, lostPassword (gera token), lostPasswordConfirmation (troca senha), import (cria users em massa — usado pelo script QBO).
- **MeController** [CODIGO]: show (retorna user logado + relacionamentos), update (atualiza dados pessoais).
- **Me/AccountDeletionController** [CODIGO]: fluxo LGPD — createRequest, listRequests, cancelRequest, exportData (gera exportação de dados).
- **Me/TwoFactorController** [CODIGO]: status/setup/verify/disable de 2FA (TOTP).
- **NotificationsController** [CODIGO]: listagem, contagem, marcar lida, deletar notificações.

### 2.2 Cowork (operador)
- **DashboardController** [CODIGO]: 5 endpoints de dashboard (main, locations, services, relationship, finance) — agrega contagens e métricas (Active Locations, Active Members, Receivable Income vistos na tela [INTERFACE]).
- **ClientsController** [CODIGO]: CRUD de clientes (client_accounts + users CLIENT), busca por email, export/import CSV, import-simple, e sub-recursos por cliente (members, overview, products, benefits, bookings, invoices, mailbox).
- **InvoicesController** [CODIGO]: CRUD de invoices + fluxo de pagamento: receivePayment (registra pagamento), capturePayment (captura autorização Stripe), refundPayment, resend (reenvia email), downloadPdf, userPaymentMethods.
- **ContractsController** [CODIGO]: CRUD de contratos, attach/detach documentos, cálculo de serviço, envio para assinatura (sendcontract), URL pública, status, PDF.
- **LocationsController / VirtualOfficesController / MeetroomsController / RoomsController / DesksController** [CODIGO]: CRUD por tipo de serviço + import/export CSV + changeSearchAvailability (disponibilidade de busca).
- **BankingController** [CODIGO]: lista transações, record/void/note/category por transação, sync com Plaid.
- **SettingsController** [CODIGO]: global settings (index/update), banking list + Plaid link token + store/delete.
- **SubscriptionsController** [CODIGO]: listPlans, CRUD, portalSession (Stripe Billing Portal), cancel, sync, changePlan, extendTrialSelfService.
- **StripeConnectController** [CODIGO]: onboarding URL, external accounts CRUD (Stripe Connect).
- **BoldSignsController** [CODIGO]: identidades de assinatura BoldSign (CreateIdentity, ResendIdentity, ResendRevokedIdentity, GetIdentity).
- **ReportsController** [CODIGO]: 10 relatórios (approvedbookings, contractrenewals, daypasseslisting, invoicesoverview, leadslisting, memberslisting, revenuebylocation, revenuebymember, visitorslisting).
- **DealsOpportunitiesController** [CODIGO]: CRUD + approve/reject de oportunidades (nota: comentário `// to do Route.get coworking deal by id` no arquivo de rotas).
- **SalesPipelineController** [CODIGO]: CRUD de pipeline + updateStatus.
- **PersonasManagementsController** [CODIGO]: CRUD de personas.
- **ToursController** [CODIGO]: CRUD + approve/reject de tours.
- **DayPassController** [CODIGO]: CRUD + approve/reject de day passes.
- **MailboxesController** [CODIGO]: CRUD de caixas postais.
- **ChatController** [CODIGO]: index, firstOrCreateChat, lastMessages, showChatMessages, newMessage (usa tabelas chats/chat_messages).
- **BookingsAndAgendaController** [CODIGO]: unapproved e scheduled.
- **SearchController** [CODIGO]: busca de usuários/clientes/leads.
- **CoworkStatusController** [CODIGO]: GET/PUT status do cowork.
- **TaxesController** [CODIGO]: CRUD de impostos.
- **EmployeesController** [CODIGO]: convites + CRUD de funcionários.
- **CalendarIntegrationsController** [CODIGO]: list/delete integrações de calendário.
- **AuthGoogleController / AuthExchangeController** [CODIGO]: redirect/callback OAuth Google e Exchange.

### 2.3 Client (membro)
- **MyMembershipController** [CODIGO]: list, show, services, bookings, mailbox, invoices da própria assinatura.
- **InvoicesController (Client)** [CODIGO]: index/show das próprias faturas.
- **MeetingController (Client)** [CODIGO]: list/show/request/cancel de reuniões.
- **DayPassController (Client)** [CODIGO]: request/requestVisit.
- **MailboxesController (Client)** [CODIGO]: index/show/update.
- **TeamMembersController** [CODIGO]: convites de equipe + acceptInvite.
- **ChatController (Client)** [CODIGO]: chat do cliente.
- **ContractController (Client)** [CODIGO]: URL do contrato.
- **ToursController (Client)** [CODIGO]: store de tour.
- **SpacesController (Client)** [CODIGO]: reserveNow.

### 2.4 Admin
- **AuditLogController** [CODIGO]: stats, show, index de logs de auditoria (tabela logs/admin_audit_logs).
- **DiscountsController** [CODIGO]: CRUD + deactivate + validatePublic de códigos de desconto.
- **SubscriptionsController (Admin)** [CODIGO]: metrics, cohorts, extendTrial, show por cowork_account.
- **WebhookDLQController** [CODIGO]: stats, show, retry, discard da fila de dead-letter de webhooks.
- **AuthController (Admin)** [CODIGO]: login de admin.

---

## 3. Tasks em background (adonis5-scheduler)

Todas em `app/Tasks/`, todas herdam `BaseTask` de `adonis5-scheduler` [CODIGO]:

| Task | Schedule (cron) | O que faz |
|---|---|---|
| GenerateInvoice | `0 2 * * *` (2h diária) | Gera faturas recorrentes |
| OverdueInvoice | `0 5 * * * *` (a cada hora no minuto 5) | Marca faturas vencidas |
| PlaidReconciliation | `0 */2 * * *` (2h em 2h) | Match automático transação→invoice via Plaid |
| ProcessDataDeletion | `0 3 * * *` (3h diária) | Processa pedidos LGPD vencidos (status requested com scheduled_execution_at <= NOW) |
| ProcessEmailQueue | `* * * * *` (cada minuto) | Processa fila de emails (email_queue) |
| ProcessWebhookRetryQueue | `*/5 * * * *` (5 em 5 min) | Retenta webhooks falhos (DLQ) |
| ProcessWhatsappQueue | `* * * * *` (cada minuto) | Processa fila de WhatsApp |
| RenewContractTask | `0 1 * * *` (1h diária) | Renova contratos |

**ACHADO CRÍTICO [CODIGO + RUNTIME]:** o `adonis5-scheduler` está registrado como provider no `.adonisrc.json`, MAS o processo do container roda apenas `node server.js` (verificado via /proc: PID 1 = tini → node server.js; nenhum processo `ace scheduler:run`). O scheduler do adonis5-scheduler exige o comando separado `node ace scheduler:run` (README do pacote). Portanto as 8 tasks **estão definidas mas NÃO estão executando** no ambiente atual. Nenhum log de scheduler nos logs do container.

---

## 4. Integrações externas

| Integração | Arquivo | Tamanho/linhas | Implementação real? |
|---|---|---|---|
| Stripe (pagamentos) | app/Integrations/Payments/Implementation/StripeImplementation.ts | 385 linhas, 40 chamadas async/axios | SIM [CODIGO] — charge, refund, capture, payment methods, customer |
| Stripe Connect | app/Services/Cowork/StripeConnectService.ts | — | SIM [CODIGO] |
| Stripe Subscriptions | app/Services/Cowork/StripeSubscriptionService.ts | — | SIM [CODIGO] |
| Plaid (banking) | app/Integrations/BankReconciliation/Implementation/PlaidImplementation.ts | 185 linhas | SIM [CODIGO] — link token, sync transactions |
| WhatsApp Meta Cloud | app/Integrations/Whatsapp/MetaCloudImplementation.ts | 122 linhas | SIM [CODIGO] — envio de mensagens |
| Docusign (eSignature) | app/Integrations/ESignature/Implementation/DocusignImplementation.ts | 159 linhas | SIM [CODIGO] — auth + envelopes |
| AdobeSign | app/Integrations/AdobeSign/Implementation/AdobeSignImplementation.ts | 82 linhas | SIM [CODIGO] (parcial) |
| BoldSign | app/Integrations/BoldSign/implemetation/BoldSign.impl.ts | 250 linhas | SIM [CODIGO] — identidades, documentos |
| Calendar Google | app/Integrations/calendar/ (via AuthGoogleController) | — | SIM [CODIGO] |
| Calendar Exchange | app/Integrations/calendar/ (via AuthExchangeController) | — | SIM [CODIGO] |
| AWS SES (email) | app/Tasks/ProcessEmailQueue.ts + envs SES_* | — | SIM [CODIGO] |

**Env usado pelo container** (env-pc/workeaser-api.env): STRIPE_SECRET_KEY/WEBHOOK_SECRET definidos, GOOGLE_CLIENT_ID/SECRET = `placeholder`, DOCUSIGN_INTEGRATION_KEY/USER_ID = `placeholder`, PLAID_CLIENT_ID = `placeholder`, EXCHANGE_CLIENT_ID = `placeholder`, ADOBE_SIGN com valores, AWS = local-dev, MAPBOX = pk.local, SES_MAIL_FROM = noreply... [CODIGO — valores redigidos].

**Erros reais registrados** (docker logs, 23/07): `GET /api/cowork/boldsign/identities/me` → `TypeError: Invalid URL` — BoldSign.getIdentityDetails usa base URL relativa (`/v1-beta/...`) sem host configurado → integração BoldSign QUEBRADA em runtime [RUNTIME].

---

## 5. Middlewares

| Middleware | Registro | Função |
|---|---|---|
| SecurityHeaders | global | Headers de segurança (CSP etc.) |
| LoggerMiddleware | global | Loga requisições (tabela logs) |
| Auth | named `auth` | Autentica bearer token OAT |
| SilentAuth | named `silentAuth` | Auth opcional (não falha se ausente) |
| CoworkAuthorization | named | Garante role COWORKING/ADMIN + associação ao cowork |
| ClientAuthorization | named | Garante role CLIENT + associação |
| AdminAuthorization | named | Garante role ADMIN |
| BoldSignValidation | named | Valida assinatura webhook BoldSign |
| RateLimit | named `rateLimit` | Rate limit in-memory por IP+slot (HF-POLISH-02), configurável por env (RATE_LIMIT_AUTH_*) |

---

## 6. Validators

- `app/Validators/Auth/` — login, signup, email confirmation, lost password [CODIGO]
- `app/Validators/Client/` — day pass, meeting, mailbox, team, tours, spaces [CODIGO]
- Demais validators inline nos controllers (schema validator do Adonis) [CODIGO]

---

## 7. Sinais de código incompleto / legado

- **DealsOpportunitiesController**: comentário `// to do Route.get coworking deal by id` no arquivo de rotas (rota GET /:id registrada, comentário indica intenção incompleta) [CODIGO]
- **BoldSign**: integração registrada e chamada pela UI, mas quebrada em runtime (Invalid URL) [RUNTIME]
- **Google/Exchange/Docusign/Plaid**: envs com `placeholder` → autenticações OAuth não funcionam com credenciais reais [CODIGO]
- **AuthController.import**: rota sem middleware — cria users em massa, endpoint interno exposto [CODIGO]
- **Duplicação client/team.ts**: rota `GET /` registrada duas vezes em grupos diferentes (listInvites e index) [CODIGO]
- 108 models para 63 controllers — cobertura ampla mas muitas tabelas sem uso (ver análise do banco)
- **Logs do container** mostram erros repetidos de BoldSign em 23/07 — integração nunca chegou a funcionar [RUNTIME]
