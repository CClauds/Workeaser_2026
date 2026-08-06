# Workeaser — Funcionalidades e Rastreabilidade (04)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] · [INTERFACE] · [BANCO] · [RUNTIME] · [NAO_CONFIRMADO]
> **Classificação de status:** ✅ confirmada por código e fluxo completo · 🔬 confirmada por teste automatizado · 🟢 aparentemente funcional, sem teste · 🟡 parcialmente implementada · 🔴 somente frontend · ⚪ somente backend · 💀 código não utilizado · 🧟 legado · ❌ quebrada · ❓ não foi possível confirmar

---

## A. Rastreamento completo — funcionalidades centrais

### A.1 Login
1. **Nome:** Login
2. **Objetivo:** autenticar usuário e iniciar sessão
3. **Perfil:** todos (público)
4. **Ponto de entrada:** /login
5. **Tela/rota:** /login (frontend), POST /api/auth/login
6. **Componente:** src/pages/login/index.tsx + LoginBox
7. **Evento:** clique em LOG IN (submit do form)
8. **Endpoint:** POST /api/auth/login
9. **Método:** POST
10. **Controller:** AuthController.login (workeaser-api)
11. **Serviço:** UserService (via controller; verifica hash argon2 via Adonis Hash)
12. **Regras de negócio:** email_confirmed deve ser true; role define redirect (COWORKING/ADMIN→/dashboard, CLIENT→/spaces)
13. **Validações frontend:** campos obrigatórios, formato email
14. **Validações backend:** rate limit (rateLimit:auth_login), Hash.verify
15. **Tabelas consultadas:** users
16. **Tabelas alteradas:** api_tokens (INSERT), logs (INSERT LOGIN_SUCCESS)
17. **Operações:** SELECT user por email; INSERT token; INSERT log
18. **Integrações:** nenhuma
19. **Eventos/webhooks:** nenhum
20. **Jobs/filas:** nenhum
21. **Resposta:** { status: 'OK', result: { type, token, expires_at, user } }
22. **Atualização interface:** cookie user-token + redirect por role
23. **Tratamento de erros:** "Email or password is incorrect" (400), "Email has not been confirmed yet" (400), RATE_LIMIT (429)
24. **Logs:** logs (AUTH LOGIN_SUCCESS com ip/ua)
25. **Testes:** não encontrados [NAO_CONFIRMADO]
26. **Status:** ✅ confirmada por código e fluxo completo (testado em execução 06/08) [RUNTIME]
27. **Evidências:** routes/auth.ts:4; AuthController.login; login/index.tsx; config/hash.ts (argon2)

### A.2 Dashboard do operador
1. **Nome:** Dashboard (métricas)
2. **Objetivo:** visão geral de unidades, membros, receita
3. **Perfil:** COWORKING/ADMIN (sidebar)
4. **Tela/rota:** /dashboard; GET /api/cowork/dashboard
5. **Componente:** src/pages/dashboard/index.tsx (linhas 163-328)
6. **Evento:** carregamento da página (GSSP + SWR fallback)
7. **Endpoint:** GET /api/cowork/dashboard
8. **Método:** GET
9. **Controller:** Cowork/DashboardController.mainDashboard
10. **Serviço:** serviços de dashboard (agregações)
11. **Regras:** exibe Active Locations (10), Open Opportunities (0), Active Members (239), Receivable Income ($800.00)
12. **Validações:** auth (sem módulo)
13. **Tabelas consultadas:** locations, users/cowork_clients, invoices (vazia)
14. **Alteradas:** nenhuma
15. **Integrações:** nenhuma
16. **Resposta:** JSON com métricas
17. **Atualização interface:** cards + gráficos echarts (gauge/funnel/pie) + tabelas (No data)
18. **Erros:** 401 sem token → redirect login
19. **Logs:** LoggerMiddleware
20. **Testes:** não encontrados
21. **Status:** ✅ confirmada por código e fluxo completo [CODIGO + INTERFACE]
22. **Evidências:** routes/cowork/dashboard.ts; dashboard/index.tsx; dashboard observado [INTERFACE]

### A.3 CRUD de Locations
1. **Nome:** CRUD de unidades
2. **Perfil:** COWORKING/ADMIN (módulo LOCATIONS)
3. **Tela/rota:** /locations/*; GET/POST/PUT/DELETE /api/cowork/locations
4. **Componente:** páginas de locations + LocationHeader
5. **Controller:** Cowork/LocationsController (index, store, show, update, delete, export, import)
6. **Regras:** soft delete; permissão módulo LOCATIONS via coworkAuthorization
7. **Tabelas:** locations, addresses, location_amenities
8. **Dados:** 10 unidades cadastradas [BANCO]
9. **Status:** 🟢 aparentemente funcional, sem teste (CRUD no código + 10 registros)
10. **Evidências:** routes/cowork/locations.ts; locations com dados [BANCO]

### A.4 CRUD de Virtual Offices
1. **Perfil:** COWORKING/ADMIN
2. **Tela:** /services/virtual-office; /api/cowork/virtualoffices (CRUD + export + import + changeavailability)
3. **Controller:** Cowork/VirtualOfficesController
4. **Tabelas:** virtual_offices (7 planos: $49–$399/mês + anual $100/mês), virtual_office_prices (7)
5. **Status:** 🟢 funcional (catálogo); sem contratos vinculados
6. **Evidências:** [CODIGO + BANCO]

### A.5 CRUD de Meetrooms + reservas
1. **Perfil:** COWORKING/ADMIN (módulo MEETROOM)
2. **Tela:** /services/meeting-room; /api/cowork/meetrooms (CRUD + book + approve/reject)
3. **Controller:** Cowork/MeetroomsController (bookingMeeting, bookingMeetingApprove, bookingMeetingReject)
4. **Tabelas:** meetrooms (5: BB-8, C-3PO, R2-D2, The Empire, Jedi Council), meetroom_questions (7), meetroom_answers (21)
5. **Status:** 🟢 catálogo funcional; 🔴 0 reservas; ⚠️ preço 5500 (centavos?) vs 350/800 (dólares) inconsistente [BANCO]
6. **Evidências:** [CODIGO + BANCO]

### A.6 CRUD de Clientes (Client Management)
1. **Perfil:** COWORKING/ADMIN (módulo RELATIONSHIP)
2. **Tela:** /relationship/client-management/*; /api/cowork/clients (CRUD + search + export + import + importSimple + sub-recursos)
3. **Controller:** Cowork/ClientsController
4. **Regras:** clientAuthorization/coworkAuthorization:RELATIONSHIP
5. **Tabelas:** client_accounts (240), users (CLIENT), cowork_clients (240)
6. **Status:** 🟢 CRUD funcional; ⚠️ ~20 emails compostos quebram login
7. **Evidências:** [CODIGO + BANCO + RUNTIME]

### A.7 Invoices (CRUD + pagamento)
1. **Perfil:** COWORKING/ADMIN (módulo FINANCES)
2. **Tela:** /finances/invoices/*; /api/cowork/finance/invoices (CRUD + receivePayment + capturePayment + refundPayment + resend + pdf)
3. **Controller:** Cowork/InvoicesController
4. **Integrações:** Stripe (StripeImplementation)
5. **Tabelas:** invoices, invoice_items, invoice_payment_histories, payments — TODAS VAZIAS [BANCO]
6. **Status:** 🟡 parcialmente implementada — código completo, 0 faturas, Stripe em teste
7. **Evidências:** [CODIGO + BANCO + CONFIG]

### A.8 Invoice pública (pagamento sem login)
1. **Tela:** /invoice-payment/[id]; GET/POST /api/invoice/:uuid (+/pdf)
2. **Controller:** PublicInvoicesController
3. **Status:** 🟡 código completo, sem dados
4. **Evidências:** [CODIGO]

### A.9 Contracts + eSignature
1. **Perfil:** COWORKING/ADMIN (RELATIONSHIP)
2. **Tela:** Quick Actions ATTACH/DETACH CONTRACT; /api/cowork/relationship/contracts (CRUD + sendcontract + pdf + status + url)
3. **Controller:** Cowork/ContractsController
4. **Integrações:** Docusign/AdobeSign/BoldSign (eSignature)
5. **Tabelas:** contracts + sub-tabelas — VAZIAS [BANCO]
6. **Status:** 🟡 código completo; 🔴 BoldSign QUEBRADA [RUNTIME]; 0 contratos
7. **Evidências:** [CODIGO + RUNTIME]

### A.10 Banking (Plaid)
1. **Tela:** /finances/banking; /api/cowork/finance/banking (+ sync/record/void/note/category); /settings/banking*
2. **Controller:** Cowork/BankingController + SettingsController
3. **Integração:** Plaid (placeholder)
4. **Tabelas:** bank_accounts, bank_account_transactions, linked_bank_accounts — VAZIAS
5. **Status:** 🟡 código completo; sem dados; env placeholder
6. **Evidências:** [CODIGO + CONFIG + BANCO]

### A.11 Subscriptions (Stripe Billing)
1. **Tela:** /settings/subscriptions (manage, upgrade); /api/cowork/subscriptions (+plans, portal-session, cancel, change-plan, extend-trial-self-service, validate-discount)
2. **Controller:** Cowork/SubscriptionsController + Admin/SubscriptionsController (metrics, cohorts, extend-trial)
3. **Integração:** Stripe (teste)
4. **Tabelas:** subscription_plans (3: Solo, Growth, Network), subscriptions — VAZIA
5. **Status:** 🟡 código completo; 0 assinaturas
6. **Evidências:** [CODIGO + BANCO]

### A.12 Leads / Pipeline / Oportunidades
1. **Tela:** /relationship/lead-management/*, /deals-and-opportunities/*; /api/cowork/relationship/salespipeline, /personasmanagement, /dealsopportunities
2. **Controller:** SalesPipelineController, PersonasManagementsController, DealsOpportunitiesController
3. **Tabelas:** leads, lead_opportunities — VAZIAS
4. **Status:** 🟡 código completo; 0 dados; feature flag LEADS_FEATURE no frontend
5. **Evidências:** [CODIGO + BANCO]

### A.13 Day Pass / Tours / Mailbox / Meetings (clientes)
- **Day Pass:** /api/cowork/relationship/daypass (CRUD + approve/reject); /api/client/day-pass (request, visit). Tabela vazia. 🟡
- **Tours:** /api/cowork/relationship/tour (CRUD + approve/reject); /api/client/spaces/tours. Tabela vazia. 🟡
- **Mailbox:** /api/cowork/relationship/mailbox (CRUD); /api/client/mailbox. Tabela vazia. 🟡
- **Meetings:** /api/cowork/meetrooms/book*; /api/client/meeting (list, show, request, cancel). Tabela vazia. 🟡

### A.14 Reports
1. **Tela:** /reports; /api/cowork/reports (10 endpoints)
2. **Controller:** Cowork/ReportsController
3. **Status:** 🟡 código completo; sem dados (tabelas vazias)
4. **Evidências:** [CODIGO + BANCO]

### A.15 Admin de plataforma (admin-api)
1. **Tela:** sem UI dedicada (API-only) [NAO_CONFIRMADO]
2. **Endpoints:** POST /api/auth/login (admin), /api/admin/partners* (CRUD, SYSTEM_DIRECTOR), /api/admin/coworkings, /clients, /users/:id/suspend|unsuspend, /api/admin/dashboard
3. **Controller:** admin-api AuthController, PartnersController, ClientsController, DashboardController
4. **Regras:** suspend = soft delete (users.deleted_at); partner não pode se auto-deletar; garante ≥1 SYSTEM_DIRECTOR
5. **Tabelas:** partners, partner_api_tokens, admin_audit_logs — VAZIAS
6. **Status:** 🟡 código funcional; 0 partners; órfão do frontend
7. **Evidências:** [CODIGO + BANCO]

### A.16 Importação de clientes (QBO)
1. **Tela:** /relationship/client-management/import; POST /api/cowork/clients/import
2. **Script:** import-qbo-customers.py (carga única, 240 clientes)
3. **Tabelas:** client_accounts (240), users (238 CLIENT)
4. **Status:** ✅ executado uma vez (carga real) [BANCO]; ⚠️ bug de hash bcrypt corrigido em 06/08 (re-hash argon2id)
5. **Evidências:** [BANCO + memória]

---

## B. Matriz rápida por área

| Área | Status | Observação |
|---|---|---|
| Auth completo (login/signup/email/lost-password/logout) | ✅ | testado |
| 2FA | 🟡 | código, sem uso |
| LGPD | 🟡 | código; task não roda |
| Dashboard | ✅ | testado |
| Locations | 🟢 | 10 registros |
| Services catálogo | 🟢 | 4 tipos |
| VO catálogo | 🟢 | 7 planos |
| Meetrooms catálogo | 🟢 | 5 salas; preço inconsistente |
| Desks | 🟢 | 4 mesas |
| Rooms | ⚪ | 0 salas, 3 preços |
| Clientes CRUD | 🟢 | 240 |
| Invoices | 🟡 | 0 dados |
| Payments Stripe | 🟡 | 0 dados; teste |
| Contracts | 🟡 | 0 dados; eSign quebrado |
| Meetings/Bookings | 🟡 | 0 dados |
| Day Pass | 🟡 | 0 dados |
| Mailbox | 🟡 | 0 dados |
| Leads/Pipeline | 🟡 | 0 dados; feature flag |
| Banking/Plaid | 🟡 | 0 dados; placeholder |
| Subscriptions | 🟡 | 0 assinaturas |
| Taxes | 🟡 | 0 dados |
| Reports | 🟡 | 0 dados |
| Chat | 🟡 | 0 dados; Omnichat comentado |
| Teams/Employees | 🟡 | 0 dados |
| Admin partners | 🟡 | 0 partners; órfão |
| Tasks scheduler | ❌ | NÃO RODA |
| Webhooks | 🟡 | BoldSign quebrada |
| Onboarding email | ❌ | task não roda |
