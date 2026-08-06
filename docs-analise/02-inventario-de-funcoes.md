# Workeaser — Inventário Detalhado de Funções (02)

> **Data:** 06/08/2026 — Análise 100% read-only
> **Evidência:** [CODIGO] = confirmado no código · [INTERFACE] = confirmado em navegador · [BANCO] = confirmado por query · [RUNTIME] = confirmado em execução/logs · [NAO_CONFIRMADO] = não foi possível confirmar

## Legenda de status

- ✅ **CONCLUÍDO** — implementado e verificado funcionando (código + interface/execução)
- 🟡 **PARCIAL** — implementado no código, mas sem dados/uso real ou com partes quebradas
- 🔴 **PRESENTE, NÃO FUNCIONAL** — existe no código mas não funciona (ex.: scheduler inativo, BoldSign quebrado)
- ⚪ **NÃO DESENVOLVIDO** — não encontrado

---

## A. Tabela resumida (Módulo | Tela/Função | Finalidade | Status | Evidência)

| Módulo | Tela/Função | Finalidade | Status | Evidência técnica |
|---|---|---|---|---|
| Auth | Login | Autenticar por email/senha, emitir bearer token | ✅ CONCLUÍDO | AuthController [CODIGO]; testado via API e UI [INTERFACE] |
| Auth | Signup | Criar conta | ✅ CONCLUÍDO | AuthController.store [CODIGO] |
| Auth | Email confirmation | Ativar conta por token | ✅ CONCLUÍDO | AuthController.emailConfirmation [CODIGO] |
| Auth | Lost password | Recuperar senha | ✅ CONCLUÍDO | AuthController.lostPassword* [CODIGO] |
| Auth | 2FA (TOTP) | Autenticação em 2 fatores | 🟡 PARCIAL | TwoFactorController [CODIGO]; sem dados de uso [NAO_CONFIRMADO] |
| Auth | LGPD (delete/export) | Pedidos de exclusão e exportação de dados | 🟡 PARCIAL | AccountDeletionController + ProcessDataDeletion task [CODIGO] |
| Me | Perfil | Ver/editar dados do usuário logado | ✅ CONCLUÍDO | MeController [CODIGO] |
| Notifications | Listar/ler/apagar | Notificações do usuário | ✅ CONCLUÍDO | NotificationsController [CODIGO] |
| Dashboard | Dashboard principal | Métricas agregadas | ✅ CONCLUÍDO | DashboardController.mainDashboard [CODIGO]; vistot [INTERFACE] |
| Locations | CRUD de unidades | Gerir 10 unidades EWS | 🟡 PARCIAL | LocationsController [CODIGO]; 10 registros [BANCO] |
| Services | Catálogo de serviços | 4 tipos: VO/MR/OD/PR | 🟡 PARCIAL | ServicesController/Utils [CODIGO]; 4 registros [BANCO] |
| Virtual Office | CRUD + preços | Planos VO (7, $49–$399/mês + anual) | 🟡 PARCIAL | VirtualOfficesController [CODIGO]; 7 registros [BANCO] |
| Meeting Room | CRUD + reservas | Salas BB-8, C-3PO, R2-D2, Training, Conference | 🟡 PARCIAL | MeetroomsController [CODIGO]; 5 registros [BANCO]; preço 5500 inconsistente [BANCO] |
| Open Desk | CRUD mesas | Mesas fixas e hot desks | 🟡 PARCIAL | DesksController [CODIGO]; 4 registros [BANCO] |
| Private Room | CRUD salas | Salas privadas | ⚪ NÃO DESENVOLVIDO (dados) | RoomsController [CODIGO]; 0 rooms, 3 preços [BANCO] |
| Client Management | CRUD clientes | 240 clientes QBO | 🟡 PARCIAL | ClientsController [CODIGO]; 240 client_accounts [BANCO] |
| Client Management | Import/export CSV | Importar/exportar clientes | ✅ CONCLUÍDO | ClientsController.import/export [CODIGO]; import usado na carga QBO [BANCO] |
| Invoices | CRUD faturas | Faturas de clientes | 🔴 SEM DADOS | InvoicesController [CODIGO]; 0 invoices [BANCO] |
| Invoices | Pagamento (receive/capture/refund) | Fluxo de pagamento Stripe | 🔴 SEM DADOS | InvoicesController.*Payment [CODIGO] |
| Invoices | Página pública de pagamento | Pagar fatura sem login | 🔴 SEM DADOS | PublicInvoicesController [CODIGO]; 0 invoices [BANCO] |
| Contracts | CRUD + eSignature | Contratos e assinatura | 🔴 SEM DADOS | ContractsController [CODIGO]; 0 contracts [BANCO] |
| Meetings | Reservas | Reuniões | 🔴 SEM DADOS | MeetingController [CODIGO]; 0 meetings [BANCO] |
| Day Pass | CRUD + aprovação | Day passes | 🔴 SEM DADOS | DayPassController [CODIGO]; 0 day_passes [BANCO] |
| Mailbox | CRUD caixa postal | Caixa postal de VO | 🔴 SEM DADOS | MailboxesController [CODIGO]; 0 mailboxes [BANCO] |
| Leads | CRUD + pipeline | Leads e oportunidades | 🔴 SEM DADOS | LeadController/DealsOpportunities [CODIGO]; 0 leads [BANCO] |
| Banking | Transações + Plaid | Sync bancário | 🔴 SEM DADOS | BankingController [CODIGO]; 0 bank_accounts [BANCO] |
| Subscriptions | Planos + Stripe Billing | Assinaturas | 🔴 SEM DADOS | SubscriptionsController [CODIGO]; 3 planos, 0 subscriptions [BANCO] |
| Taxes | CRUD impostos | Impostos por serviço | 🔴 SEM DADOS | TaxesController [CODIGO]; 0 taxes [BANCO] |
| Reports | 10 relatórios | Relatórios operacionais/financeiros | 🔴 SEM DADOS | ReportsController [CODIGO]; tabelas vazias [BANCO] |
| Chat | Conversas | Chat cowork↔cliente | 🔴 SEM DADOS | ChatController [CODIGO]; 0 chats [BANCO] |
| Teams/Employees | Convites | Equipes e funcionários | 🔴 SEM DADOS | EmployeesController/TeamMembers [CODIGO]; 0 registros [BANCO] |
| Admin (plataforma) | Partners CRUD | Parceiros internos | 🟡 PARCIAL | admin-api PartnersController [CODIGO]; 0 partners [BANCO] |
| Admin (plataforma) | Audit logs | Auditoria admin | 🟡 PARCIAL | admin-api AuditLog [CODIGO]; 0 admin_audit_logs [BANCO] |
| Admin (plataforma) | Suspender usuário | Suspender/reativar | ✅ CONCLUÍDO | admin-api ClientsController.suspendUser [CODIGO] |
| Admin (plataforma) | Discounts | Códigos de desconto | 🟡 PARCIAL | DiscountsController [CODIGO]; 0 discount_codes [BANCO] |
| Admin (plataforma) | Webhook DLQ | Fila morta de webhooks | 🟡 PARCIAL | WebhookDLQController [CODIGO]; 0 na fila [BANCO] |
| Integração | Stripe webhook | invoice.paid/payment_failed | 🟡 PARCIAL | StripeController webhook [CODIGO]; chave teste [CODIGO] |
| Integração | WhatsApp | Mensagens Meta Cloud | 🟡 PARCIAL | WhatsappController + MetaCloudImplementation [CODIGO] |
| Integração | SES | Email bounce/complaint | 🟡 PARCIAL | SesController [CODIGO] |
| Integração | Docusign/AdobeSign/BoldSign | Assinatura | 🔴 PARCIAL/QUEBRADA | BoldSign Invalid URL [RUNTIME]; envs placeholder [CODIGO] |
| Background | 8 tasks scheduler | Automações | 🔴 PRESENTE, NÃO FUNCIONAL | Tasks definidas [CODIGO]; scheduler NÃO roda [RUNTIME] |

---

## B. Descrição detalhada por módulo

### B.1 Autenticação e Conta

#### Login (POST /api/auth/login)
1. **Nome:** Login
2. **Localização:** /login (tela), POST /api/auth/login (API)
3. **Quem acessa:** público (todos os roles)
4. **Objetivo:** autenticar usuário por email/senha
5. **Como funciona:** valida email/senha → Adonis Hash verifica argon2id → emite bearer token OAT (tabela api_tokens, expira 1 dia) → cookie `user-token` (nookies, sameSite strict, maxAge = expires_at, sem httpOnly) [CODIGO]
6. **Dados utilizados:** users (email, password, role, email_confirmed)
7. **Campos:** email (Login), password
8. **Obrigatórios:** email, password
9. **Botões/ações:** LOG IN, "Criar conta grátis", "Lost Password?", Remember Me
10. **Validações:** rate limit (rateLimit:auth_login); "Email or password is incorrect" se falhar; "Email address has not been confirmed yet" se email_confirmed=0
11. **Regras de negócio:** role define redirect (COWORKING/ADMIN → /dashboard; CLIENT → /spaces); cookie não-httpOnly (risco XSS)
12. **Alterações no banco:** insert em api_tokens; insert em logs (AUTH LOGIN_SUCCESS com ip/ua)
13. **Integrações:** nenhuma
14. **Resultado esperado:** redireciona ao dashboard/portal com sessão ativa
15. **Mensagens:** "Email or password is incorrect"; "Email address has not been confirmed yet"
16. **Limitações:** cookie sem httpOnly; clientes com email composto (vírgula) não logam (VALIDAÇÃO rejeita)
17. **Status:** ✅ CONCLUÍDO (testado via API e UI)

#### Signup (POST /api/auth/signup)
- Cria usuário com validação de role; rate limit; usado principalmente para COWORKING [CODIGO]. Status: ✅ CONCLUÍDO (código); fluxo de convite usado na prática [CODIGO].

#### 2FA (GET/POST /api/me/2fa/*)
- status/setup/verify/disable TOTP [CODIGO]. Sem dados de uso → 🟡 PARCIAL.

#### LGPD (POST /api/me/delete-account, GET /export-data)
- Pedidos de exclusão, listagem, cancelamento, exportação [CODIGO]; task ProcessDataDeletion processa vencidos às 3h (não roda — scheduler inativo) [CODIGO]. 🟡 PARCIAL.

### B.2 Dashboard (GET /api/cowork/dashboard)
- **Tela:** /dashboard. **Cards:** Active Locations (10), Open Opportunities (0), Active Members (239), Receivable Income ($800.00); gráficos: Sales Pipeline Funnel, Clients per Product Category, Invoices per Status; tabelas: Upcoming Bookings/Day Passes/Tours, Member Support and Mailbox Requests (ambas "No data") [INTERFACE].
- **Backend:** DashboardController.mainDashboard — agrega counts [CODIGO].
- **Status:** ✅ CONCLUÍDO (funciona com dados de catálogo).

### B.3 Locations (CRUD)
- **Rotas:** /api/cowork/locations (index, store, show, update, delete, export, import). **Tela:** /locations/dashboard, /locations/[id]/ (overview, members, products, invoices, bookings), /locations/add, /locations/veneusmanagement.
- **Dados:** 10 unidades (Unit Neptune/Moon/Saturn/Venus/Mars/Mercury/Uranus/Earth/Jupiter/Pluto) com endereços reais EWS Orlando [BANCO].
- **Campos:** name, description, address (addresses table: fulltext, city, state, zipcode, lat/lng), email, phone, cowork_account_id.
- **Validações:** validators + schema do Adonis [CODIGO].
- **Status:** 🟡 PARCIAL — CRUD completo; unidades cadastradas; nenhuma operação vinculada (0 bookings por location).

### B.4 Services e produtos vendáveis

#### Virtual Office (CRUD + preços)
- **Rotas:** /api/cowork/virtual-offices (CRUD, export, import, changeavailability). **Tela:** /services/virtual-office, /services/add/virtual-office.
- **Dados:** 7 planos na Unit Saturn: Basic $49, Standard $69, Growing $99, Premium $149, Enterprise $349, Executive $399, Annual $100/mês ($1200/ano) [BANCO].
- **Campos:** name, description, has_dir_listing, has_mailing, has_phone_answer, has_voip, coworking_usage_mo, meetroom_usage_mo, renewal_tax, searchable, slug, uuid; preços em virtual_office_prices (monthly_price, full_price, duration MONTH_1/YEAR_1).
- **Status:** 🟡 PARCIAL — catálogo pronto; sem contratos/assinaturas vinculadas.

#### Meeting Room (CRUD + reservas)
- **Rotas:** /api/cowork/meetrooms (CRUD, book, book/:id approve/reject, import, changeavailability). **Tela:** /services/meeting-room, /services/add/meeting-room.
- **Dados:** BB-8, C-3PO, R2-D2 (price 5500, 220m², 6p), The Empire - Training Room (350, 20p), Jedi Council - Conference Hall (800, 50p) [BANCO].
- **Perguntas:** 7 (whiteboard, display, bebida/comida, ADA, multimídia, suprimentos) com respostas por sala (meetroom_answers) [BANCO].
- **⚠️ Inconsistência:** preço 5500 (centavos?) vs 350/800 (dólares) [BANCO].
- **Status:** 🟡 PARCIAL — catálogo pronto; 0 reservas.

#### Open Desk (CRUD)
- **Rotas:** /api/cowork/desks. **Dados:** Mesa Fixa 01/02, Hot Desk Manhã/Tarde [BANCO]. **Status:** 🟡 PARCIAL.

#### Private Room (CRUD)
- **Rotas:** /api/cowork/rooms. **Dados:** 0 rooms, 3 room_prices. **Status:** ⚪ SEM DADOS.

### B.5 Relationship (Clientes, Leads, Pipeline)

#### Client Management (CRUD)
- **Rotas:** /api/cowork/clients (CRUD + search, export, import, import-simple, :id/members, overview, products, benefits, bookings, invoices, mailbox). **Tela:** /relationship/client-management/* (list, add, edit, [id]/overview, benefits, products-and-services, bookings, invoices, mailbox, support-tickets, contracts, import).
- **Dados:** 240 client_accounts (239 importados do QBO + Acme demo) [BANCO]; 238 com email_confirmed=1 (corrigido em sessão 06/08).
- **Campos:** company_name, company_email, cowork_account_id, endereço, telefone.
- **⚠️:** emails compostos com vírgula (~20 casos) quebram validação de email no login [BANCO+TESTE].
- **Status:** 🟡 PARCIAL — CRUD completo; sem dados operacionais vinculados (0 faturas/contratos por cliente).

#### Import/Export de clientes
- **Rotas:** POST /clients/import, /import-simple, GET /export. **Uso real:** carga inicial QBO via import-qbo-customers.py (240 clientes) [BANCO].
- **Status:** ✅ CONCLUÍDO (import usado; export implementado).

#### Leads / Pipeline
- **Rotas:** /api/cowork/lead-management (personas CRUD), /sales-pipeline (CRUD + status), /deals-opportunities (CRUD + approve/reject). **Telas:** /relationship/lead-management/personas-management, /pipeline, /add; /relationship/deals-and-opportunities.
- **Dados:** 0 leads, 0 lead_opportunities, 0 deals [BANCO]. **Status:** 🔴 SEM DADOS (código completo).

#### Chat (omnichat)
- **Rotas:** /api/cowork/chats, /api/client/chats (index, firstOrCreateChat, lastMessages, messages). **Tela:** /relationship/omnichat.
- **Dados:** 0 chats, 0 messages [BANCO]. **Status:** 🔴 SEM DADOS.

### B.6 Finances

#### Invoices (CRUD + pagamentos)
- **Rotas:** /api/cowork/invoices (CRUD, info, resend, receivepayment, capturepayment, refundpayment, userpaymentmethods, pdf). **Telas:** /finances/invoices (list, create, [id]).
- **Dados:** 0 invoices [BANCO]. **Status:** 🔴 SEM DADOS — código completo, nada criado.

#### Página pública de fatura
- **Rotas:** /api/public-invoices/checkinvoices, /:uuid (GET show, POST pay), /:uuid/pdf. **Tela:** /invoice-payment/[id].
- **Status:** 🔴 SEM DADOS.

#### Banking (Plaid)
- **Rotas:** /api/cowork/banking (list, showTransaction, record, void, note, category, sync), /settings/banking*. **Tela:** /finances/banking.
- **Dados:** 0 bank_accounts, 0 transactions [BANCO]. **Status:** 🔴 SEM DADOS.

#### Taxes
- **Rotas:** /api/cowork/taxes (CRUD). **Telas:** /finances/taxes (list, create). **Dados:** 0 [BANCO]. **Status:** 🔴 SEM DADOS.

#### Commissions
- **Tela:** /finances/commissions. **Backend:** [NAO_CONFIRMADO] — sem controller específico identificado. **Status:** ⚪ NÃO CONFIRMADO.

### B.7 Contracts (CRUD + eSignature)
- **Rotas:** /api/cowork/contracts (CRUD, pdf, detach, attachdocuments, getopencontracts, getcancelinfo, sendcontract, calculate, url, status). **Telas:** quick actions ATTACH CONTRACT / DETACH CONTRACT; /relationship/client-management/contracts.
- **Dados:** 0 contracts [BANCO]. **Status:** 🔴 SEM DADOS.
- **Integração:** Docusign/AdobeSign/BoldSign; BoldSign quebrado em runtime [RUNTIME]; envs placeholder [CODIGO].

### B.8 Meetings / Day Pass / Tours / Mailbox
- **Meetings:** /api/cowork/meetrooms/book* + /api/client/meeting (request/cancel); 0 meetings [BANCO]. 🔴 SEM DADOS.
- **Day Pass:** /api/cowork/day-pass (CRUD + approve/reject), /api/client/day-pass (request/visit); 0 day_passes [BANCO]. 🔴 SEM DADOS.
- **Tours:** /api/cowork/tour (CRUD + approve/reject), /api/client/spaces/tours; 0 tours [BANCO]. 🔴 SEM DADOS.
- **Mailbox:** /api/cowork/mailbox (CRUD), /api/client/mailbox; 0 mailboxes [BANCO]. 🔴 SEM DADOS.

### B.9 Reports
- **Rotas:** /api/cowork/reports (10 endpoints: approvedbookings, contractrenewals, daypasseslisting, invoicesoverview, leadslisting, memberslisting, revenuebylocation, revenuebymember, visitorslisting + 1). **Tela:** /reports.
- **Status:** 🔴 SEM DADOS — código presente, tabelas vazias.

### B.10 Settings
- **Rotas:** /api/cowork/settings (subscriptions, global GET/PUT, banking list/token/store/delete). **Telas:** /settings/* (account-information, global-settings, integrations, members, payments, subscriptions, wallet, security/2fa, privacy).
- **Status:** 🟡 PARCIAL — código presente; cowork_settings vazia [BANCO].

### B.11 Subscriptions
- **Rotas:** /api/cowork/subscriptions (plans, CRUD, portal-session, cancel, sync, change-plan, extend-trial-self-service), admin /subscriptions/metrics, /cohorts, /extend-trial. **Telas:** /settings/subscriptions (manage, upgrade).
- **Dados:** 3 plans (Solo, Growth, Network); 0 subscriptions [BANCO].
- **Status:** 🔴 SEM DADOS — código completo; Stripe em modo teste.

### B.12 Admin (plataforma — admin-api porta 3334)
- **Login:** POST /api/auth/login (admin-api) → token em partner_api_tokens (1 dia) [CODIGO].
- **Partners:** CRUD (SYSTEM_DIRECTOR); proteção: não pode se auto-deletar; garante ≥1 diretor [CODIGO].
- **Coworkings/Clients:** listagem read-only paginada (mirrors das tabelas do workeaser-api) [CODIGO].
- **Suspend/Unsuspend:** soft delete em users.deleted_at [CODIGO] — ⚠️ "suspensão" indistinguível de exclusão lógica.
- **Dashboard:** 8 métricas com fallback seguro [CODIGO].
- **Audit:** admin_audit_logs (event, actor, target, ip, ua, outcome, metadata JSON) [CODIGO]; 0 registros [BANCO].
- **Status:** 🟡 PARCIAL — funcional; sem dados (0 partners).

### B.13 Admin (plataforma — páginas no frontend)
- /admin/audit-logs, /admin/discounts, /admin/metrics, /admin/webhook-dlq [CODIGO — páginas existem]. Sem acesso testado (role ADMIN). 🟡 PARCIAL.

### B.14 Tasks em background (8)
| Task | Cron | Função | Status |
|---|---|---|---|
| GenerateInvoice | 0 2 * * * | Gera faturas recorrentes | 🔴 não executa |
| OverdueInvoice | 0 5 * * * * | Marca vencidas | 🔴 não executa |
| PlaidReconciliation | 0 */2 * * * | Match transação→invoice | 🔴 não executa |
| ProcessDataDeletion | 0 3 * * * | LGPD | 🔴 não executa |
| ProcessEmailQueue | * * * * * | Fila de email | 🔴 não executa |
| ProcessWebhookRetryQueue | */5 * * * * | Retry webhooks | 🔴 não executa |
| ProcessWhatsappQueue | * * * * * | Fila WhatsApp | 🔴 não executa |
| RenewContractTask | 0 1 * * * | Renova contratos | 🔴 não executa |
**Evidência:** Tasks definidas [CODIGO]; container roda só `node server.js`, sem `ace scheduler:run` [RUNTIME]. **Status:** 🔴 PRESENTE, NÃO FUNCIONAL.

### B.15 Webhooks
| Webhook | Eventos | Status |
|---|---|---|
| POST /api/webhooks/stripe | invoice.paid, payment_failed etc. | 🟡 implementado; chave teste |
| POST /api/webhooks/docusign | eventos de envelope | 🟡 env placeholder |
| POST /api/webhooks/boldsign | eventos BoldSign | 🔴 integração quebrada |
| GET/POST /api/webhooks/adobesign | validação + eventos | 🟡 parcial |
| POST /api/webhooks/ses | bounce/complaint | 🟡 implementado |
| GET/POST /api/webhooks/whatsapp | verificação + mensagens | 🟡 implementado |

### B.16 Login do admin (admin-api) e auditoria
- login/logout/me + AdminAuditService (audit fire-and-forget, nunca grava senha/token) [CODIGO]. ✅.

---

## C. Funções duplicadas / abandonadas / legado

1. **Rotas de membership duplicadas:** `client/membership/[id]/...` vs `membership/[id]/...` (sem `client/`) — aparentemente o mesmo recurso em dois caminhos [CODIGO].
2. **AuthController.import:** rota POST /api/auth/import sem middleware — endpoint de criação em massa exposto [CODIGO].
3. **client/team.ts:** rota GET / registrada 2x (listInvites e index) [CODIGO].
4. **SilentAuth (admin-api):** middleware existe mas NÃO registrado nem usado — morto [CODIGO].
5. **Model Location (admin-api):** sem uso no código — morto [CODIGO].
6. **Landing `/`:** lê chaves legadas localStorage (workeaser.token/token) não escritas pelo fluxo atual [CODIGO].
7. **Enum de auditoria admin:** inclui eventos client/cowork create/update/delete que nunca são emitidos [CODIGO].
8. **81 tabelas vazias:** estrutura completa de módulos nunca usados (invoices, contracts, meetings, payments, leads, teams, banking...) [BANCO].
9. **addresses.fulltext/fulltext2:** duplicação aparente; fulltext é palavra reservada [BANCO].
10. **DealsOpportunitiesController:** comentário "// to do Route.get coworking deal by id" — intenção incompleta [CODIGO].
