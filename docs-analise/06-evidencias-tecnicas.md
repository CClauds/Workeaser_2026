# Workeaser — Evidências Técnicas (06)

> **Data:** 06/08/2026 — Análise 100% read-only
> **Objetivo:** rastrear TODOS os arquivos, rotas, componentes, tabelas e endpoints usados como evidência na documentação.

---

## 1. Código-fonte (local)

Raiz: `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\src\`

### 1.1 workeaser-api (`workeaser-api\workeaser-management-api-main\`)
- **start/routes.ts** — registro de todas as rotas (lido inteiro)
- **start/kernel.ts** — middlewares globais e nomeados (lido inteiro)
- **start/events.ts** + **start/events/user.ts** — evento user:email_confirmed → onboarding (lido)
- **start/bouncer.ts** — políticas de autorização (existência)
- **start/routes/**: auth.ts, me.ts, notifications.ts, photos.ts, publicInvoices.ts, spaces.ts, videos.ts, wallet.ts, documents.ts, infos.ts, healthcheck.ts + admin/ (auditlogs, auth, discounts, subscriptions, webhookdlq) + client/ (chats, contract, daypass, invoices, mailbox, meeting, membership, spaces, team, tours) + cowork/ (authExchange, authGoogle, banking, boldsign, bookingsandagenda, calendarintegrations, chats, clients, contracts, dashboard, daypass, dealssopportunities, desks, employees, invoices, locations, mailbox, meetrooms, personasmanagement, reports, rooms, salespipeline, search, settings, status, stripeconnect, subscriptions, taxes, tour, virtualoffices) + webhooks/ (adobesign, boldsign, docusign, ses, stripe, whatsapp) — TODOS lidos (grep de rotas + middlewares)
- **app/Controllers/Http/** — 63 controllers (listados integralmente no inventário): Admin/ (AuditLog, Auth, Discounts, Subscriptions, WebhookDLQ), AuthController, Client/ (Chat, Contract, DayPass, Invoices, Mailboxes, Meeting, MyMembership, Spaces, TeamMembers, Tours), Cowork/ (AuthExchange, AuthGoogle, Banking, BoldSigns, BookingsAndAgenda, CalendarIntegrations, Chat, Clients, Contracts, CoworkStatus, Dashboard, DayPass, DealsOpportunities, Desks, Employees, Invoices, Locations, Mailboxes, Meetrooms, PersonasManagements, Reports, Rooms, SalesPipeline, Search, Settings, StripeConnect, Subscriptions, Taxes, Tours, VirtualOffices), DocumentsController, Me/ (AccountDeletion, TwoFactor), MeController, NotificationsController, PhotosController, PublicInvoicesController, SpacesController, Utils/ (Amenities, ContractTermSize, MeetroomQuestions, Services, TaxTypes), VideosController, WalletController, Webhooks/ (AdobeSign, BoldSign, Docusign, Ses, Stripe, Whatsapp)
- **app/Models/** — 108 models (lista completa no inventário do workeaser-api)
- **app/Tasks/** — 8 tasks com schedule (lidos): GenerateInvoice (0 2 * * *), OverdueInvoice (0 5 * * * *), PlaidReconciliation (0 */2 * * *), ProcessDataDeletion (0 3 * * *), ProcessEmailQueue (* * * * *), ProcessWebhookRetryQueue (*/5 * * * *), ProcessWhatsappQueue (* * * * *), RenewContractTask (0 1 * * *)
- **app/Integrations/** — StripeImplementation.ts (385 linhas), PlaidImplementation.ts (185), MetaCloudImplementation.ts (122), DocusignImplementation.ts (159), AdobeSignImplementation.ts (82), BoldSign.impl.ts (250)
- **app/Middleware/** — Auth, SilentAuth, CoworkAuthorization, ClientAuthorization, AdminAuthorization, BoldSignValidation, RateLimit, SecurityHeaders, LoggerMiddleware (registrados no kernel)
- **app/Services/** — Admin/, Client/, Cowork/, Cowork/Reports/, LogService, OnboardingEmailService, etc.
- **config/hash.ts** — driver default argon2 (t=3, m=4096, p=1)
- **config/auth.ts** — guard OAT, provider lucid, uids email
- **config/cors.ts** — CORS_ALLOWED_ORIGINS (atualizado 06/08: inclui :3005)
- **.adonisrc.json** — preloads e providers (adonis5-scheduler presente; preloads NÃO incluem scheduler)
- **server.js** — apenas httpServer().start() (sem scheduler)
- **package.json** — deps (adonis5-scheduler ^2.0.2 etc.)

### 1.2 admin-api (`admin-api\admin-management-api-main\`)
- **start/routes.ts** + start/routes/{auth,partners,clients,dashboard}.ts — lidos inteiros
- **start/kernel.ts** — globais + nomeados (auth, adminRole, rateLimit; SilentAuth NÃO registrado)
- **app/Controllers/Http/**: AuthController, PartnersController, ClientsController, DashboardController (lidos)
- **app/Services/**: AuthService, PartnerService, ClientsService, DashboardService, AdminAuditService (lidos)
- **app/Models/**: Partner, User, ClientAccount, CoworkAccount, Location, AdminAuditLog (lidos — mirrors read-only)
- **database/migrations/**: 4 migrations (partners, partner_api_tokens, add_role, admin_audit_logs)
- **config/auth.ts** — guard api sobre Partner, tabela partner_api_tokens
- **tests/functional/** — testes existentes (lidos pelo subagente)

### 1.3 workeaser-frontend (`workeaser-frontend\workeaser-management-frontend-main\`)
- **src/pages/** — 100+ páginas (listadas integralmente no inventário do frontend)
- **src/components/**: Layouts (CoworkingLayout, LoginLayout), Sidebar/index.tsx, Header/index.tsx, Client/Header, Menus/QuickactionsMenu/index.tsx, Headers/ (SettingsHeader, ClientSettingsHeader, ClientHeader, LocationHeader, PageHeader), Client/MemberSidebar, Chart/, Dashboard/DashboardCard, Table/Row/StatusContainer, LoginBox, DotsMenu/ (Menu, InvoiceOptions), CustomLink, Icomoon
- **src/contexts/**: AuthContext.tsx, MenuContext.tsx, SpacesContext.tsx
- **src/hooks/** — hooks globais
- **src/services/**: apiClient/index.ts, api/index.ts, api/auth/, api/cowork/locations/, api/cowork/financial/, api/fileUpload/, api/middleware.ts, map/index.ts
- **src/features/**, **src/types/**, **src/utils/**, **src/styles/**
- **package.json** — Next.js, SWR, axios, echarts

---

## 2. Banco de dados (MySQL 8.4 — workeaser_local)

**Acesso:** `docker exec workeaser-mysql mysql -uworkeaser -pworkeaser_dev workeaser_local`

**Queries executadas (SELECT/SHOW apenas):**
- information_schema.tables (108 tabelas + row counts)
- information_schema.key_column_usage (7 FKs)
- SHOW COLUMNS: locations, services, addresses, virtual_offices, virtual_office_prices, meetrooms, meetroom_answers, cowork_users, cowork_clients, logs, photos, meetroom_questions
- SELECT: users (244), api_tokens (114), cowork_accounts (1), cowork_users (6), cowork_clients (240), client_accounts (240), locations (10), addresses (11), services (4), amenities (18), location_amenities (2), virtual_offices (7), virtual_office_prices (7), meetrooms (5), meetroom_questions (7), meetroom_answers (21), desks (4), subscription_plans (3), client_modules (6), cowork_modules (6), cowork_user_modules (42), logs (150, amostra), photos (28)

**Tabelas com dados (27):** addresses, amenities, api_tokens, client_accounts, client_modules, cowork_accounts, cowork_clients, cowork_modules, cowork_user_modules, cowork_users, desks, location_amenities, locations, logs, meetroom_answers, meetroom_photos, meetroom_questions, meetrooms, photos, room_prices, services, subscription_plans, users, virtual_office_prices, virtual_offices + adonis_schema (289) + adonis_schema_versions

**Tabelas vazias (81):** admin_audit_logs, bank_account_transactions, bank_accounts, calendar_integrations, cards, chat_messages, chats, client_account_modules, contract_activities, contract_documents, contract_notifications, contract_renewals, contract_usages, contracts, cowork_external_accounts, cowork_settings, cowork_stripe_accounts, data_deletion_requests, day_pass_taxes, day_passes, desk_fees, desk_photos, desk_prices, discount_codes, discount_redemptions, documents, email_queue, employee_invite_capabilities, employee_invite_locations, employee_invites, employee_locations, events, initial_fees, invoice_activities, invoice_contracts, invoice_item_fee_taxes, invoice_item_fees, invoice_items, invoice_payment_histories, invoices, lead_opportunities, leads, linked_bank_accounts, location_photos, location_services, mailbox_histories, mailbox_photos, mailboxes, meeting_billings, meeting_taxes, meetings, message_attachments, message_photos, message_videos, notes, notifications, partner_api_tokens, partners, payment_histories, payment_history_initial_fees, payments, room_fees, room_photos, rooms, space_reserve_requests, subscriptions, tax_services, taxes, team_member_invite_capabilities, team_member_invite_locations, team_member_invites, team_member_locations, team_members, teams, tours, user_email_activations, user_integrations, user_lost_passwords, videos, virtual_office_fees, virtual_offices_photos, webhook_dead_letter_queue, whatsapp_messages

---

## 3. Runtime / infra

- **docker ps** — 4 containers: workeaser-frontend (0.0.0.0:3005→3000, healthy), workeaser-api (:3333), workeaser-admin-api (:3334), workeaser-mysql (:3307→3306)
- **/proc/1/cmdline (workeaser-api)** — `/usr/bin/tini -- node server.js` (sem scheduler)
- **docker logs workeaser-api** — erros BoldSign Invalid URL (23/07); LOGIN_SUCCESS (06/08)
- **docker logs grep scheduler** — 0 ocorrências
- **curl health checks** — /health/db 200 (3ms API, 101ms admin)
- **Testes de login via API** (POST /api/auth/login): admin/demo/clientes amostrais — PASS
- **Teste de login via navegador** (http://localhost:3005): PASS — dashboard carregado [INTERFACE]
- **Teste CORS** (fetch do navegador → 172.16.4.26:3333): falhou antes do fix (Failed to fetch); PASS após atualizar CORS_ALLOWED_ORIGINS + restart

---

## 4. Configurações

- **env-pc/workeaser-api.env** — 45 variáveis (APP_KEY, DB, CORS_ALLOWED_ORIGINS atualizado, STRIPE/PLAID/GOOGLE/DOCUSIGN/EXCHANGE/ADOBE/AWS/SES/MAPBOX)
- **env-pc/admin-api.env** — 12 variáveis (APP_KEY, DB, PORT)
- **.env.docker** — variáveis de build frontend (NEXT_PUBLIC_API_URL, MAPBOX, POSTHOG, SENTRY, RATE_LIMIT_*)
- **compose.pc.yml** — 4 serviços; frontend mapeia 3005:3000; envs montados como volume :ro
- **config/hash.ts** — argon2 (t=3, m=4096, p=1)
- **config/cors.ts** — allowlist CORS_ALLOWED_ORIGINS
- **config/auth.ts** (ambos) — guard OAT

---

## 5. Arquivos de apoio consultados

- `A:\Claude-Deep\Temp\import-qbo-customers.py` — script de importação QBO (hash bcrypt — origem do bug de login)
- `A:\Claude-Deep\backups\workeaser-orlando-2026-07-23\` — backup do deploy (compose, envs, dump, seeders)
- `A:\Claude-Deep\backups\workeaser-passwords-2026-08-06\pre-password-change.sql` — dump pré-troca de senhas
- `A:\Claude-Deep\memory\06-workeaser\*.md` — memórias do projeto (deploy NAS/PC, council 27/07 e 04/08)
- `A:\Claude-Deep\Temp\workeaser-new-passwords.json` — credenciais novas (SENSÍVEL)
- **Resumos de subagentes (delegation 06/08):**
  - `C:\Users\Roger\AppData\Local\hermes\profiles\omni\cache\delegation\subagent-summary-0-20260806_115221_208275.txt` — workeaser-api (39.6KB — tabela completa de rotas com middlewares de módulo CoworkModulesEnum)
  - `C:\Users\Roger\AppData\Local\hermes\profiles\omni\cache\delegation\subagent-summary-1-20260806_115221_209270.txt` — admin-api
  - `C:\Users\Roger\AppData\Local\hermes\profiles\omni\cache\delegation\subagent-summary-2-20260806_115221_210266.txt` — frontend (15.6KB — 118 páginas, layouts, endpoints, feature flags)

---

## 6. Análises intermediárias (subagentes)

- `A:\Claude-Deep\docs\workeaser-doc\analises\01-workeaser-api.md` — análise do workeaser-api (21KB)
- `A:\Claude-Deep\docs\workeaser-doc\analises\02-admin-api.md` — análise do admin-api (25KB)
- `A:\Claude-Deep\docs\workeaser-doc\analises\03-frontend.md` — análise do frontend (37KB)
- `A:\Claude-Deep\docs\workeaser-doc\analises\04-banco-de-dados.md` — análise do banco (10KB)

---

## 7. Endpoints testados em runtime (06/08)

| Endpoint | Método | Resultado |
|---|---|---|
| http://localhost:3005 | GET | 200 — tela de login |
| http://172.16.4.26:3333/health/db | GET | 200 {"ok":true} |
| http://localhost:3334/health/db | GET | 200 {"ok":true} |
| /api/auth/login (admin@workeaser.com) | POST | 200 — token emitido |
| /api/auth/login (4 clientes amostrais) | POST | 200 — token emitido |
| /api/auth/login (medstation email composto) | POST | 422 VALIDATION_ERROR (email inválido) |
| POST /api/auth/login (via browser fetch) | POST | falhou "Failed to fetch" (CORS) → PASS após fix |
| /api/cowork/boldsign/identities/me (23/07, logs) | GET | 500 TypeError Invalid URL |
