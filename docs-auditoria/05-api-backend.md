# Workeaser — API Backend (05)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] — arquivos de rotas lidos integralmente
> **Nota:** não há OpenAPI/Swagger/Postman encontrado no repositório [NAO_CONFIRMADO]. Esta é a documentação gerada a partir do código.

---

## 1. workeaser-api (porta 3333) — ~170 endpoints

### 1.1 Auth e Me
| Método | Endpoint | Finalidade | Auth | Permissão | Handler | Banco |
|---|---|---|---|---|---|---|
| POST | /api/auth/login | Login | público | — | AuthController.login | users, api_tokens, logs |
| POST | /api/auth/signup | Criar conta | público | — | AuthController.store | users |
| POST | /api/auth/logout | Logout | público | — | AuthController.logout | api_tokens |
| POST | /api/auth/email-confirmation | Confirmar email | público | — | AuthController.emailConfirmation | users |
| POST | /api/auth/resend-email-confirmation | Reenviar confirmação | público | — | AuthController.resendEmailConfirmation | users |
| POST | /api/auth/lost-password | Pedir reset | público | — | AuthController.lostPassword | user_lost_passwords |
| POST | /api/auth/lost-password-confirmation | Redefinir senha | público | — | AuthController.lostPasswordConfirmation | users |
| POST | /api/auth/import | Criar users em massa | **NENHUMA** | — | AuthController.import | users ⚠️ exposto |
| GET | /api/me | Perfil | auth | — | MeController.show | users |
| PUT | /api/me | Atualizar perfil | auth | — | MeController.update | users |
| POST | /api/me/delete-account | Pedir exclusão (LGPD) | auth | — | Me/AccountDeletionController.createRequest | data_deletion_requests |
| GET | /api/me/delete-account | Listar pedidos | auth | — | .listRequests | data_deletion_requests |
| DELETE | /api/me/delete-account/:id | Cancelar pedido | auth | — | .cancelRequest | data_deletion_requests |
| GET | /api/me/export-data | Exportar dados | auth | — | .exportData | várias |
| GET | /api/me/2fa | Status 2FA | auth | — | TwoFactorController.status | users |
| POST | /api/me/2fa/setup | Setup TOTP | auth | — | .setup | users |
| POST | /api/me/2fa/verify | Verificar TOTP | auth | — | .verify | users |
| POST | /api/me/2fa/disable | Desativar 2FA | auth | — | .disable | users |
| GET | /api/notifications | Listar | auth | — | NotificationsController.show | notifications |
| GET | /api/notifications/count | Contar | auth | — | .count | notifications |
| POST | /api/notifications/read-all | Ler todas | auth | — | .markAllAsRead | notifications |
| POST | /api/notifications/:id/read | Ler uma | auth | — | .markAsRead | notifications |
| DELETE | /api/notifications/:id | Apagar | auth | — | .delete | notifications |

### 1.2 Infos / Spaces / Uploads (públicos)
| Método | Endpoint | Finalidade | Auth | Handler |
|---|---|---|---|---|
| GET | /api/infos/amenities | Amenities | — | Utils/AmenitiesController.index |
| GET | /api/infos/services | Serviços | — | Utils/ServicesController.index |
| GET | /api/infos/taxtypes | Tipos de imposto | — | Utils/TaxTypesController.index |
| GET | /api/infos/termsizes | Tamanhos de contrato | — | Utils/ContractTermSizeController.index |
| GET | /api/infos/meetroomquestions | Perguntas meetroom | — | Utils/MeetroomQuestionsController.index |
| GET | /api/spaces, /:id, /:serviceType/:id | Espaços públicos | — | SpacesController |
| GET | /api/space/vo/:slug, /mr/:slug, /od/:slug, /pr/:slug | Espaços por slug | — | SpacesController |
| GET | /api/invoice/checkinvoices | Check de faturas | silentAuth | PublicInvoicesController.checkInvoices |
| GET | /api/invoice/:uuid | Ver fatura pública | silentAuth | .show |
| POST | /api/invoice/:uuid | Pagar fatura pública | silentAuth | .pay |
| GET | /api/invoice/:uuid/pdf | PDF da fatura | silentAuth | .generatePdf |
| GET/POST/DELETE | /api/photos, /api/videos, /api/documents | Uploads | silentAuth/store, auth/delete | Photos/Videos/Documents |
| GET | /api/wallet/token_link | Plaid link token | silentAuth | WalletController.generateTokenLink |
| GET/POST/PUT/DELETE | /api/wallet/:payment_type(/:id) | Carteira | auth | WalletController |
| GET | /health, /health/db, /health/version | Health checks | — | inline |

### 1.3 Cowork (operador) — ~110 endpoints
**Auth:** auth + coworkAuthorization:${Módulo} (FINANCES/RELATIONSHIP/LOCATIONS/MEETROOM/REPORTS/ACCOUNT_SETTINGS)

| Método | Prefixo | Ações | Módulo | Handler |
|---|---|---|---|---|
| GET | /api/cowork/dashboard (+/locations,/services,/relationship,/finance) | 5 dashboards | auth | DashboardController |
| GET/POST/PUT/DELETE | /api/cowork/locations (+export, /import) | CRUD | LOCATIONS | LocationsController |
| GET/POST/PUT/DELETE | /api/cowork/desks (+export, /import, /changeavailability) | CRUD | LOCATIONS | DesksController |
| GET/POST/PUT/DELETE | /api/cowork/rooms (+export, /import, /changeavailability) | CRUD | LOCATIONS | RoomsController |
| GET/POST/PUT/DELETE | /api/cowork/virtualoffices (+export, /import, /changeavailability) | CRUD | — | VirtualOfficesController |
| GET/POST/PUT/DELETE | /api/cowork/meetrooms (+export, /import, /changeavailability, /book, /book/:id approve/reject) | CRUD+reservas | MEETROOM | MeetroomsController |
| GET/POST/PUT/DELETE | /api/cowork/clients (+search, /export, /import, /import-simple, /:id/members, /overview, /products, /benefits, /bookings, /invoices, /mailbox) | CRUD+sub | RELATIONSHIP | ClientsController |
| GET/POST/PUT/DELETE | /api/cowork/finance/invoices (+info, /resend, /receivepayment, /capturepayment, /refundpayment, /userpaymentmethods, /pdf) | CRUD+pagamento | FINANCES | InvoicesController |
| GET | /api/cowork/finance/banking/:id (+/:transactionId, /record, /void, /note, /category, /sync) | Banking | FINANCES | BankingController |
| GET/POST/PUT/DELETE | /api/cowork/relationship/contracts (+pdf, /detach, /attachdocuments, /getopencontracts, /getcancelinfo, /sendcontract, /calculate, /url, /status) | Contratos | RELATIONSHIP | ContractsController |
| GET | /api/cowork/relationship/bookings (/unapproved, /scheduled) | Agenda | RELATIONSHIP | BookingsAndAgendaController |
| GET/POST/PUT/DELETE | /api/cowork/relationship/daypass (+approve, /reject) | Day pass | RELATIONSHIP | DayPassController |
| GET/POST/PUT/DELETE | /api/cowork/relationship/mailbox | Mailbox | RELATIONSHIP | MailboxesController |
| GET/POST/PUT/DELETE | /api/cowork/relationship/personasmanagement | Personas | RELATIONSHIP | PersonasManagementsController |
| GET/POST/PUT | /api/cowork/relationship/salespipeline (+status) | Pipeline | RELATIONSHIP | SalesPipelineController |
| GET/POST | /api/cowork/relationship/dealsopportunities (+approve, /reject) | Oportunidades | RELATIONSHIP | DealsOpportunitiesController |
| GET/POST/PUT/DELETE | /api/cowork/relationship/tour (+approve, /reject) | Tours | RELATIONSHIP | ToursController |
| GET/POST | /api/cowork/chats (+lastmessages, /:uuid/messages) | Chat | RELATIONSHIP | ChatController |
| GET | /api/cowork/search (/, /client/:id, /lead/:id) | Busca | auth | SearchController |
| GET | /api/cowork/reports (10 endpoints) | Relatórios | REPORTS | ReportsController |
| GET/PUT | /api/cowork/settings (global, /subscriptions, /banking, /banking/token) | Config | ACCOUNT_SETTINGS | SettingsController |
| GET/PUT | /api/cowork/status | Status | — | CoworkStatusController |
| GET/POST/DELETE | /api/cowork/stripe-connect (onboardingurl, externalaccount) | Stripe Connect | — | StripeConnectController |
| GET/POST | /api/cowork/subscriptions (+plans, /portal-session, /cancel, /sync, /change-plan, /extend-trial-self-service, /validate-discount) | Assinaturas | — | SubscriptionsController |
| GET/POST/PUT/DELETE | /api/cowork/taxes | Impostos | — | TaxesController |
| GET/POST/DELETE | /api/cowork/employees (invites + CRUD) | Funcionários | ACCOUNT_SETTINGS | EmployeesController |
| GET/POST | /api/cowork/boldsign (identities + resend + resend-revoked + me) | BoldSign | ACCOUNT_SETTINGS | BoldSignsController |
| GET | /api/cowork/settings/calendar (+google/redirect, /exchange/redirect) | Calendários | ACCOUNT_SETTINGS | CalendarIntegrationsController |
| GET | /api/google/callback, /api/exchange/callback | OAuth callbacks | público | AuthGoogle/ExchangeController |

### 1.4 Client (membro) — ~25 endpoints
**Auth:** auth + clientAuthorization

| Método | Prefixo | Ações | Handler |
|---|---|---|---|
| GET | /api/client/membership (+/:id, /services, /bookings, /mailbox, /invoices) | Minha assinatura | MyMembershipController |
| GET | /api/client/invoices (+/:id) | Minhas faturas | InvoicesController (Client) |
| GET/POST | /api/client/meeting (list, show, request, cancel) | Reservas | MeetingController |
| POST | /api/client/day-pass/request, /visit | Day pass | DayPassController |
| GET/PUT | /api/client/mailbox (+/:id) | Caixa postal | MailboxesController |
| GET/POST/DELETE | /api/client/teams (invites + CRUD + acceptInvite) | Equipe | TeamMembersController |
| GET/POST | /api/client/chats (+/:uuid/messages) | Chat | ChatController |
| GET | /api/client/contract/:id/url | Contrato | ContractController |
| POST | /api/client/spaces/tours, /reserve | Tours/reserva | ToursController/SpacesController |

### 1.5 Admin (plataforma, no workeaser-api)
**Auth:** auth + adminAuthorization

| Método | Endpoint | Finalidade | Handler |
|---|---|---|---|
| POST | /api/auth/admin | Login admin (SEM rateLimit) | Admin/AuthController.login |
| GET | /api/admin/audit-logs (+/stats, /:id) | Auditoria | Admin/AuditLogController |
| GET/POST | /api/admin/discounts (+/:id/deactivate) | Descontos | Admin/DiscountsController |
| GET | /api/cowork/subscriptions/validate-discount | Validar cupom (só auth) | Admin/DiscountsController.validatePublic |
| GET | /api/admin/subscriptions/metrics, /cohorts, /:id/extend-trial, /:cowork_account_id | Métricas | Admin/SubscriptionsController |
| GET/POST | /api/admin/webhook-dlq (+/stats, /:id, /retry, /discard) | DLQ | Admin/WebhookDLQController |

### 1.6 Webhooks (públicos, assinatura validada)
| Método | Endpoint | Proteção | Handler |
|---|---|---|---|
| GET/POST | /api/webhooks/adobesign | — (não valida) | AdobeSignController |
| POST | /api/webhooks/boldsign | HMAC x-boldsign-signature | BoldSignController |
| POST | /api/webhooks/docusign | header X-ADOBESIGN-CLIENTID | DocusignController |
| POST | /api/webhooks/ses | anti-replay SNS MessageId | SesController |
| POST | /api/webhooks/stripe | stripe.webhooks.constructEvent + nonce | StripeController |
| GET/POST | /api/webhooks/whatsapp | WHATSAPP_META_VERIFY_TOKEN / HMAC X-Hub-Signature-256 | WhatsappController |

---

## 2. admin-api (porta 3334) — 20 endpoints

| Método | Endpoint | Finalidade | Auth | Permissão | Handler | Banco |
|---|---|---|---|---|---|---|
| GET | /, /healthz, /health, /health/db, /health/version | Health | — | — | inline | — |
| POST | /api/auth/login | Login partner | público | rateLimit:auth_admin_login | AuthController.login | partners, partner_api_tokens, admin_audit_logs |
| POST | /api/auth/logout | Logout | auth | — | AuthController.logout | partner_api_tokens |
| GET | /api/auth/me | Partner atual | auth | — | AuthController.me | partners |
| GET | /api/admin/partners | Listar | auth | — | PartnersController.index | partners |
| GET | /api/admin/partners/:id | Ver | auth | — | .show | partners |
| POST | /api/admin/partners | Criar | auth | adminRole:SYSTEM_DIRECTOR | .store | partners, admin_audit_logs |
| PUT | /api/admin/partners/:id | Editar | auth | adminRole:SYSTEM_DIRECTOR | .update | partners |
| DELETE | /api/admin/partners/:id | Excluir (soft) | auth | adminRole:SYSTEM_DIRECTOR | .destroy | partners |
| GET | /api/admin/coworkings | Listar | auth | — | ClientsController.listCoworkings | cowork_accounts |
| GET | /api/admin/coworkings/:id | Ver | auth | — | .showCoworking | cowork_accounts |
| GET | /api/admin/clients | Listar | auth | — | .listClients | client_accounts, users |
| GET | /api/admin/clients/:id | Ver | auth | — | .showClient | client_accounts, users |
| POST | /api/admin/users/:userId/suspend | Suspender | auth | adminRole:SYSTEM_DIRECTOR | .suspendUser | users (deleted_at) |
| POST | /api/admin/users/:userId/unsuspend | Reativar | auth | adminRole:SYSTEM_DIRECTOR | .unsuspendUser | users |
| GET | /api/admin/dashboard | Métricas | auth | — | DashboardController.metrics | cowork_accounts, users, client_accounts, locations, partners |

---

## 3. Divergências / problemas de API

1. **Sem OpenAPI/Swagger/Postman** no repositório [NAO_CONFIRMADO]
2. `POST /api/auth/import` **sem autenticação** — criação em massa exposta [CODIGO]
3. `POST /api/auth/admin` **sem rate limit** [CODIGO]
4. Frontend chama `GET /cowork/Taxs` (maiúscula) vs rota real `/cowork/taxes` — inconsistência [CODIGO]
5. `POST resend` de invoice sem barra inicial no frontend — bug potencial de URL [CODIGO]
6. Prefixos reais: banking é `/api/cowork/finance/banking` (não `/cowork/banking`), contracts é `/api/cowork/relationship/contracts`, invoices é `/api/cowork/finance/invoices` — o frontend usa os caminhos corretos [CODIGO — grep]
7. Endpoints de reports incluem `transactionHistory/:linkedBankAccountId` não listado em algumas doc antigas [CODIGO]
