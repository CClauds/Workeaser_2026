# Workeaser — Matriz de Implementação (15)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Status:** ✅ confirmada por código e fluxo completo · 🟢 aparentemente funcional · 🟡 parcial · 🔴 somente frontend/backend · ⚪ código não utilizado · 🧟 legado · ❌ quebrada · ❓ não confirmado

---

## 1. Matriz principal

| Módulo | Função | Frontend | Backend | Banco | Permissão | Integração | Teste | Funcionamento confirmado | Evidência |
|---|---|---|---|---|---|---|---|---|---|
| Auth | Login | ✅ /login | ✅ POST /auth/login | ✅ users/api_tokens/logs | público | — | ❌ | ✅ runtime | routes/auth.ts; RUNTIME |
| Auth | Signup | ✅ /create-account | ✅ POST /auth/signup | ✅ users | público | — | ❌ | 🟢 | CODIGO |
| Auth | Email confirmation | ✅ /verify-email/[token] | ✅ /auth/email-confirmation | ✅ users | público | — | ❌ | 🟢 | CODIGO |
| Auth | Lost password | ✅ /lost-password/[token] | ✅ /auth/lost-password* | ✅ user_lost_passwords | público | — | ❌ | 🟢 | CODIGO |
| Auth | 2FA | ✅ /settings/security/2fa | ✅ /me/2fa/* | ✅ users | auth | — | ❌ | 🟡 sem uso | CODIGO |
| Auth | LGPD | ✅ /settings/privacy | ✅ /me/delete-account, /export-data | ✅ data_deletion_requests | auth | — | ❌ | 🟡 task não roda | CODIGO |
| Auth | Import users | ❌ | ✅ POST /auth/import | ✅ users | ⚠️ NENHUMA | — | ❌ | 🟡 exposto | CODIGO |
| Me | Perfil | ✅ settings/account-information | ✅ /me GET/PUT | ✅ users | auth | — | ❌ | 🟢 | CODIGO |
| Notificações | Listar/ler | ✅ sino no header | ✅ /notifications* | ✅ notifications (0) | auth | — | ❌ | 🟡 | CODIGO |
| Dashboard | Principal | ✅ /dashboard | ✅ /cowork/dashboard | ✅ agrega | auth | — | ❌ | ✅ runtime | RUNTIME+INTERFACE |
| Locations | CRUD | ✅ /locations/* | ✅ /cowork/locations | ✅ 10 reg | LOCATIONS | — | ❌ | 🟢 | CODIGO+BANCO |
| Services | Catálogo | ✅ /services/* | ✅ /infos/services | ✅ 4 reg | — | — | ❌ | 🟢 | CODIGO+BANCO |
| Virtual Office | CRUD | ✅ /services/virtual-office | ✅ /cowork/virtualoffices | ✅ 7 planos | — | — | ❌ | 🟢 catálogo | CODIGO+BANCO |
| Meetroom | CRUD+reservas | ✅ /services/meeting-room | ✅ /cowork/meetrooms | ✅ 5 salas | MEETROOM | — | ❌ | 🟢 catálogo / 0 reservas | CODIGO+BANCO |
| Open Desk | CRUD | ✅ /services/open-desks | ✅ /cowork/desks | ✅ 4 mesas | LOCATIONS | — | ❌ | 🟢 | CODIGO+BANCO |
| Private Room | CRUD | ✅ /services/private-rooms | ✅ /cowork/rooms | ⚪ 0 rooms | LOCATIONS | — | ❌ | ⚪ | CODIGO+BANCO |
| Clientes | CRUD | ✅ client-management | ✅ /cowork/clients | ✅ 240 | RELATIONSHIP | — | ❌ | 🟢 | CODIGO+BANCO |
| Clientes | Import/export | ✅ import | ✅ /clients/import/export | ✅ usado (QBO) | RELATIONSHIP | — | ❌ | ✅ carga real | BANCO |
| Invoices | CRUD | ✅ /finances/invoices | ✅ /cowork/finance/invoices | ⚪ 0 | FINANCES | — | ❌ | 🟡 | CODIGO+BANCO |
| Invoices | Pagamento | ✅ tela fatura | ✅ receive/capture/refund | ⚪ 0 | FINANCES | Stripe teste | ❌ | 🟡 | CODIGO+CONFIG |
| Invoice | Pública | ✅ /invoice-payment/[id] | ✅ /api/invoice/:uuid | ⚪ 0 | público | Stripe | ❌ | 🟡 | CODIGO |
| Contracts | CRUD+eSign | ✅ ATTACH/DETACH | ✅ relationship/contracts | ⚪ 0 | RELATIONSHIP | Docusign/BoldSign ❌ | ❌ | 🟡/❌ | CODIGO+RUNTIME |
| Meetings | Reservas | ✅ BOOK A MEETING | ✅ meetrooms/book | ⚪ 0 | MEETROOM | — | ❌ | 🟡 | CODIGO+BANCO |
| Day Pass | CRUD | ✅ BOOK A DAY PASS | ✅ relationship/daypass | ⚪ 0 | RELATIONSHIP | — | ❌ | 🟡 | CODIGO+BANCO |
| Mailbox | CRUD | ✅ MAILBOX RECEIPT | ✅ relationship/mailbox | ⚪ 0 | RELATIONSHIP | — | ❌ | 🟡 | CODIGO+BANCO |
| Tours | CRUD | ✅ (modais) | ✅ relationship/tour | ⚪ 0 | RELATIONSHIP | — | ❌ | 🟡 | CODIGO+BANCO |
| Leads/Pipeline | CRUD | ✅ lead-management | ✅ salespipeline/personas | ⚪ 0 | RELATIONSHIP | — | ❌ | 🟡 flag LEADS_FEATURE | CODIGO+BANCO |
| Deals/Opp | CRUD | ✅ deals-and-opportunities | ✅ relationship/dealsopportunities | ⚪ 0 | RELATIONSHIP | — | ❌ | 🟡 "// to do" | CODIGO |
| Banking | Transações | ✅ /finances/banking | ✅ finance/banking | ⚪ 0 | FINANCES | Plaid placeholder | ❌ | 🟡 | CODIGO+CONFIG |
| Subscriptions | Planos | ✅ /settings/subscriptions | ✅ /cowork/subscriptions | ⚪ 0 assinaturas (3 planos) | — | Stripe teste | ❌ | 🟡 | CODIGO+BANCO |
| Taxes | CRUD | ✅ /finances/taxes | ✅ /cowork/taxes | ⚪ 0 | — | — | ❌ | 🟡 frontend chama Taxs ❌ | CODIGO |
| Reports | 10 relatórios | ✅ /reports | ✅ /cowork/reports | ⚪ 0 | REPORTS | — | ❌ | 🟡 | CODIGO+BANCO |
| Chat | Conversas | ✅ /relationship/omnichat (comentado) | ✅ /cowork/chats + /client/chats | ⚪ 0 | RELATIONSHIP | — | ❌ | 🟡 | CODIGO+BANCO |
| Teams/Employees | Convites | ✅ settings/members | ✅ /employees + /teams | ⚪ 0 | ACCOUNT_SETTINGS | — | ❌ | 🟡 | CODIGO+BANCO |
| Stripe Connect | Onboarding | ❌ | ✅ /stripe-connect | ⚪ 0 | — | Stripe teste | ❌ | 🟡 | CODIGO |
| Calendários | OAuth | ✅ settings/integrations (VAZIA) | ✅ calendar-integrations + callbacks | ⚪ 0 | ACCOUNT_SETTINGS | Google/Exchange placeholder | ❌ | 🟡 | CODIGO+CONFIG |
| Admin partners | CRUD | ❌ (sem UI) | ✅ admin-api /partners | ⚪ 0 | SYSTEM_DIRECTOR | — | ❌ | 🟡 órfão | CODIGO |
| Admin suspensão | Suspend | ❌ (sem UI) | ✅ admin-api /users/:id/suspend | ✅ users.deleted_at | SYSTEM_DIRECTOR | — | ✅ tests existem | 🟢 código | CODIGO |
| Admin audit | Auditoria | ✅ /admin/audit-logs | ✅ workeaser-api /admin/audit-logs | ⚪ admin_audit_logs 0 | adminAuthorization | — | ❌ | 🟡 | CODIGO |
| Discounts | Cupons | ✅ /admin/discounts | ✅ /admin/discounts + validate-discount | ⚪ 0 | adminAuthorization | Stripe coupons | ❌ | 🟡 | CODIGO |
| Webhook DLQ | Fila morta | ✅ /admin/webhook-dlq | ✅ /admin/webhook-dlq | ⚪ 0 | adminAuthorization | — | ❌ | 🟡 retry task não roda | CODIGO+RUNTIME |
| Tasks (8) | Automação | ❌ | ✅ app/Tasks | ✅ tabelas fila | — | várias | ❌ | ❌ NÃO RODAM | RUNTIME |
| Webhooks (6) | Eventos externos | ❌ | ✅ /api/webhooks/* | ✅ DLQ | público | Stripe/SES/WA/eSign | ❌ | 🟡 BoldSign ❌ | CODIGO+RUNTIME |
| Onboarding | 3 emails | ❌ | ✅ evento user:email_confirmed | ✅ email_queue | COWORKING | SES | ❌ | ❌ task não roda | CODIGO+RUNTIME |
| Uploads | Fotos/vídeos/docs | ✅ | ✅ /photos /videos /documents | ✅ photos 28 | auth | Drive S3 | ❌ | 🟢 | CODIGO+BANCO |
| Busca global | Search | ✅ header | ✅ /cowork/search | ✅ | auth | — | ❌ | 🟢 | CODIGO |

## 2. Listas por situação

### Funcionalidades completas (confirmadas)
- Login, Logout, Signup, Email confirmation, Lost password, Perfil
- Dashboard (métricas), CRUD Locations/Services/VO/Meetrooms/Desks, CRUD Clientes + import
- Uploads (photos), Busca, Notificações (código), Health checks
- Admin suspend/unsuspend (admin-api)

### Parciais (código completo, sem dados/uso)
- 2FA, LGPD, Invoices+pagamento, Invoice pública, Contracts, Meetings, Day Pass, Mailbox, Tours, Leads/Pipeline, Deals, Banking, Subscriptions, Taxes, Reports, Chat, Teams, Stripe Connect, Calendários, Admin partners/audit/discounts/DLQ, Webhooks

### Somente backend (sem interface)
- Admin-api (partners, dashboard, clients) — sem UI
- Tasks/automações — sem UI

### Somente frontend (sem backend correspondente)
- Página /client (vazia), /settings/integrations (vazia), /settings/payments (vazia)
- /automations, /marketplace, /onboarding (presença mínima)
- Landing / (CTA /signup quebrado)

### Abandonadas/legado
- membership/[id]/* (duplicado), Menus/MemberSidebar (não importado), SilentAuth (admin-api), Model Location (admin-api), AdobeSign (legado), build-arm64.ps1, 81 tabelas vazias

### Quebradas
- BoldSign (Invalid URL) [RUNTIME]
- Scheduler/tasks (não rodam) [RUNTIME]
- Login de clientes com email composto [RUNTIME]
- getTax → /cowork/Taxs [CODIGO]

### Não foi possível confirmar
- Execução dos testes existentes, cobertura, timeout de chamadas externas, transações multi-tabela, N+1, mass assignment no workeaser-api, versões de dependências vulneráveis
