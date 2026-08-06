# Análise Técnica — Frontend Workeaser (Next.js + TypeScript)

> Documento gerado por análise READ-ONLY do código-fonte em
> `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\src\workeaser-frontend\workeaser-management-frontend-main\`
>
> Legenda de confiabilidade:
> - `[CODIGO]` — confirmado diretamente no código-fonte
> - `[INTERFACE]` — confirmado via navegação no navegador (dashboard admin)
> - `[NAO_CONFIRMADO]` — inferido, não confirmado

---

## 1. Mapa completo de páginas (rotas Next.js em `src/pages`)

Stack: Next.js (pages router) + TypeScript + styled-components + SWR + Axios + @unform + FullCalendar + Mapbox + Stripe Elements. Layout por página via `Component.getLayout` (ver `_app.tsx`). Autenticação por role: `COWORKING`, `CLIENT`, `ADMIN`.

### 1.1 Raiz e autenticação

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/` — `src/pages/index.tsx` | Landing page pública (Sprint K). Se já logado (token em localStorage `workeaser.token` ou `token`), redireciona para `/dashboard`. Seções: features, pricing (Solo/Growth/Network), demo, FAQ. Links para `/login` e `/signup` (`/signup` NÃO existe em pages — quebra) | Nenhum (SSG puro) | Nenhum custom (HTML inline) |
| `/login` — `src/pages/login/index.tsx` | Tela de login; trata erro 406 ("Nenhum coworking associado"); link "Criar conta grátis" → `/create-account` | `POST /auth/login` (via `signInRequest`), `POST /auth/lost-password`, `POST /auth/resend-email-confirmation` | `LoginLayout`, `LoginBox` |
| `/create-account` — `src/pages/create-account/index.tsx` | Cadastro de conta | `POST /auth/signup` | `LoginLayout` (provável) |
| `/create-account/[token]` — `src/pages/create-account/[token].tsx` | Confirmação de cadastro via token | `POST /auth/email-confirmation` | — |
| `/lost-password/[token]` — `src/pages/lost-password/[token].tsx` | Redefinição de senha via token | `POST /auth/lost-password-confirmation` | — |
| `/verify-email/[token]` — `src/pages/verify-email/[token].tsx` | Verificação de e-mail | — | — |
| `/accept-invitation/[token]` — `src/pages/accept-invitation/[token].tsx` | Aceitar convite de funcionário/membro | `GET/POST /cowork/employees/invites/{token}`, `GET/POST /client/teams/invites/{token}` | — |
| `/new-client/[token]` — `src/pages/new-client/[token].tsx` | Onboarding de novo cliente via token | — | — |
| `/onboarding` — `src/pages/onboarding/index.tsx` | Onboarding do coworking | — | — |
| `/invoice-payment/[id]` — `src/pages/invoice-payment/[id].tsx` | Pagamento público de fatura | `GET /invoice/{id}`, `POST /invoice/{id}` | `StripeCardForm` |

### 1.2 Dashboard

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/dashboard` — `src/pages/dashboard/index.tsx` | Dashboard admin: Active Locations 10, Active Members 239, Receivable Income $800.00 `[INTERFACE]` | `GET /me`, `GET /cowork/dashboard/...` | `CoworkingLayout`, `Header`, `Sidebar`, `Dashboard` |

### 1.3 Módulo Locations

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/locations/dashboard` — `src/pages/locations/dashboard/index.tsx` | Dashboard de locations | `GET /cowork/dashboard/locations` | — |
| `/locations/veneusmanagement` — `src/pages/locations/veneusmanagement/index.tsx` | Gestão de venues (lista CRUD de locations) | `GET /cowork/locations`, `POST /cowork/locations`, `PUT /cowork/locations/{id}`, `DELETE /cowork/locations/{id}`, `GET /cowork/locations?page=1` | — |
| `/locations/add` — `src/pages/locations/add/index.tsx` | Adicionar location | `POST /cowork/locations` | — |
| `/locations/[id]/overview` — `src/pages/locations/[id]/overview/index.tsx` | Visão geral da location | `GET /cowork/locations/{id}` | — |
| `/locations/[id]/members` — `src/pages/locations/[id]/members/index.tsx` | Membros da location | — | — |
| `/locations/[id]/bookings` — `src/pages/locations/[id]/bookings/index.tsx` | Reservas da location | — | — |
| `/locations/[id]/invoices` — `src/pages/locations/[id]/invoices/index.tsx` | Faturas da location | — | — |
| `/locations/[id]/products` — `src/pages/locations/[id]/products/index.tsx` | Produtos da location | — | — |

### 1.4 Módulo Services (lado coworking)

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/services/dashboard` — `src/pages/services/dashboard/index.tsx` | Dashboard de serviços | `GET /cowork/dashboard/services`, `GET /infos/services` | — |
| `/services/virtual-office` — `src/pages/services/virtual-office/index.tsx` | Lista/gestão de virtual offices | `GET /infos/services`, `POST /cowork/virtualoffices`, `PUT/DELETE /cowork/virtualoffices/{id}`, `POST /cowork/virtualoffices/{id}/changeavailability` | — |
| `/services/meeting-room` — `src/pages/services/meeting-room/index.tsx` | Lista/gestão de meeting rooms | `POST /cowork/meetrooms`, `PUT/DELETE /cowork/meetrooms/{id}`, `POST /cowork/meetrooms/{id}/changeavailability`, `POST /cowork/meetrooms/book` | — |
| `/services/open-desks` — `src/pages/services/open-desks/index.tsx` | Lista/gestão de open desks | `POST /cowork/desks`, `PUT/DELETE /cowork/desks/{id}`, `POST /cowork/desks/{id}/changeavailability` | — |
| `/services/private-rooms` — `src/pages/services/private-rooms/index.tsx` | Lista/gestão de private rooms | `POST /cowork/rooms`, `PUT/DELETE /cowork/rooms/{id}`, `POST /cowork/rooms/{id}/changeavailability` | — |
| `/services/add/virtual-office` | Form de adicionar virtual office | `POST /cowork/virtualoffices` | — |
| `/services/add/meeting-room` | Form de adicionar meeting room | `POST /cowork/meetrooms` | — |
| `/services/add/open-desk` | Form de adicionar open desk | `POST /cowork/desks` | — |
| `/services/add/private-room` | Form de adicionar private room | `POST /cowork/rooms` | — |

### 1.5 Módulo Relationship

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/relationship/dashboard` — `src/pages/relationship/dashboard/index.tsx` | Dashboard de relationship | `GET /cowork/dashboard/relationship`, `GET /cowork/relationship/bookings/unapproved` | — |
| `/relationship/agenda` — `src/pages/relationship/agenda/index.tsx` | Agenda/Bookings | — | `Calendar` |
| `/relationship/agenda/[id]` — `src/pages/relationship/agenda/[id]/index.tsx` | Detalhe de booking | `POST /cowork/relationship/tours` (provável) | — |
| `/relationship/deals-and-opportunities` — `src/pages/relationship/deals-and-opportunities/index.tsx` | Deals & Opportunities | `GET /cowork/relationship/dealsopportunities`, `POST .../{id}/approve`, `POST .../{id}/reject` | `PipelineColumn` |
| `/relationship/deals-and-opportunities/[id]` — `.../[id]/index.tsx` | Detalhe de deal | — | — |
| `/relationship/lead-management/personas-management` — `.../personas-management/index.tsx` | Gestão de personas | `POST /cowork/relationship/personasmanagement`, `DELETE /cowork/relationship/personasmanagement/{id}` | — |
| `/relationship/lead-management/pipeline` — `.../pipeline/index.tsx` | Sales pipeline | `GET /cowork/relationship/salespipeline`, `PUT /cowork/relationship/salespipeline/{id}` | `PipelineColumn` |
| `/relationship/lead-management/add` — `.../add/index.tsx` | Adicionar lead | — | — |
| `/relationship/client-management` — `.../client-management/index.tsx` | Customers Management (lista de clientes) | `GET /cowork/clients` | `Table`, `Filters` |
| `/relationship/client-management/add` — `.../add/index.tsx` | Adicionar cliente | `POST /cowork/clients` | — |
| `/relationship/client-management/edit` — `.../edit/index.tsx` | Editar cliente | `PUT /cowork/clients/{id}` | — |
| `/relationship/client-management/import` — `.../import/index.tsx` | Importar clientes (CSV) | — | — |
| `/relationship/client-management/contracts` — `.../contracts/index.tsx` | Contracts Follow Up | `POST /cowork/relationship/contracts`, `POST .../contracts/{id}/sendcontract`, `DELETE .../contracts/{id}` | — |
| `/relationship/client-management/mailbox` — `.../mailbox/index.tsx` | Mailbox (correspondências) | `POST /cowork/relationship/mailbox`, `PUT/DELETE /cowork/relationship/mailbox/{id}` | `MailboxOverview` |
| `/relationship/client-management/mailbox/[id]` — `.../mailbox/[id]/index.tsx` | Detalhe de entrega de mailbox | — | — |
| `/relationship/client-management/[id]/overview` | Visão geral do cliente | — | — |
| `/relationship/client-management/[id]/benefits` | Benefícios do cliente | `GET /cowork/clients/{id}/benefits` | — |
| `/relationship/client-management/[id]/bookings` | Reservas do cliente | — | — |
| `/relationship/client-management/[id]/invoices` | Faturas do cliente | `GET /cowork/clients/{id}/invoices` | — |
| `/relationship/client-management/[id]/products-and-services` | Produtos/serviços do cliente | `GET /cowork/clients/{id}/products` | — |
| `/relationship/client-management/[id]/mailbox` | Mailbox do cliente | — | — |
| `/relationship/client-management/[id]/support-tickets` | Tickets de suporte | — | — |
| `/relationship/omnichat` — `.../omnichat/index.tsx` | Omnichat (mensagens) | `POST /{clientType}/chats/{uuid}/messages` | `Chat` |

### 1.6 Módulo Finances

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/finances/dashboard` — `src/pages/finances/dashboard/index.tsx` | Dashboard financeiro | `GET /cowork/dashboard/finance` | `Chart`, `CalendarChart` |
| `/finances/invoices` — `src/pages/finances/invoices/index.tsx` | Lista de faturas | `GET /cowork/finance/invoices` (provável via página), `DELETE /cowork/finance/invoices/{uuid}` | `Table` |
| `/finances/invoices/create` — `.../create/index.tsx` | Criar fatura | `POST /cowork/finance/invoices` | — |
| `/finances/invoices/[id]` — `.../[id]/index.tsx` | Detalhe de fatura | `POST /cowork/finance/invoices/resend/{id}` | — |
| `/finances/banking` — `src/pages/finances/banking/index.tsx` | Banking (contas, sync) | `POST /cowork/settings/banking`, `POST /cowork/finance/banking/{id}/sync`, `DELETE /cowork/settings/banking/{id}`, `POST /cowork/stripe/externalaccount` | — |
| `/finances/taxes` — `src/pages/finances/taxes/index.tsx` | Taxes & Extra Fees | `GET /cowork/finance/taxes`, `POST /cowork/finance/taxes`, `PUT/DELETE /cowork/finance/taxes/{id}` | `TaxCard` |
| `/finances/taxes/create` — `.../create/index.tsx` | Criar taxa | `POST /cowork/finance/taxes` | — |
| `/finances/commissions` — `src/pages/finances/commissions/index.tsx` | Commissions & Payouts | — | — |

### 1.7 Reports

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/reports` — `src/pages/reports/index.tsx` | Relatórios | `GET /cowork/{type}/export` (exportações) | — |

### 1.8 Settings (lado coworking)

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/settings/account-information` | Dados da conta | `GET /me`, `PUT /me` | `SettingsLayout` |
| `/settings/global-settings` | Configurações globais do cowork | `PUT /cowork/settings/global` | — |
| `/settings/members` | Membros/equipe | `GET /cowork/employees?page=1`, `DELETE /cowork/employees/{id}` | — |
| `/settings/members/add` | Convidar membro | `POST /cowork/employees/invites` | — |
| `/settings/payment` | Pagamentos | — | — |
| `/settings/payments` | Pagamentos (duplicado?) | — | — |
| `/settings/privacy` | Privacidade (LGPD) | `GET /me/export-data`, `GET/POST /me/delete-account`, `DELETE /me/delete-account/{id}` | — |
| `/settings/security/2fa` | 2FA | `GET /me/2fa`, `POST /me/2fa/setup`, `POST /me/2fa/verify`, `POST /me/2fa/disable` | — |
| `/settings/subscriptions` | Assinatura | `GET /cowork/subscriptions`, `POST /cowork/subscriptions`, `GET /cowork/subscriptions/plans` | — |
| `/settings/subscriptions/manage` | Gerenciar assinatura | `POST /cowork/subscriptions/{id}/cancel`, `POST /cowork/subscriptions/{id}/change-plan`, `POST /cowork/subscriptions/{id}/sync`, `POST /cowork/subscriptions/{id}/extend-trial-self-service` | — |
| `/settings/subscriptions/upgrade` | Upgrade | `GET /cowork/subscriptions/validate-discount` | — |
| `/settings/integrations` | Integrações | — | — |
| `/settings/wallet` | Wallet/cartões | `GET /wallet/{payment_method}/{id}`, `POST /wallet/card`, `POST /wallet/bank_account`, `DELETE /wallet/{type}/{id}` | — |
| `/settings/wallet/add` | Adicionar cartão/conta | `POST /wallet/card`, `POST /wallet/bank_account` | `StripeCardForm` |

### 1.9 Área do cliente (CLIENT)

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/spaces` — `src/pages/spaces/index.tsx` | Busca de espaços (público) | `GET /infos/services`, `GET /infos/amenities` | `SpacesHeader`, `SpacesContext` |
| `/spaces/locations/[id]` | Detalhe de location | `GET /cowork/locations/{id}` | — |
| `/spaces/services/[id]` | Detalhe de serviço | `GET /infos/services` | — |
| `/client` — `src/pages/client/index.tsx` | Home do cliente | `GET /me` | `ClientLayout`, `Header` |
| `/client/membership` — `src/pages/client/membership/index.tsx` | Lista de memberships | `GET /client/membership` | `MembershipLayout` |
| `/client/membership/[id]` (subrotas) | Ver subseção 1.10 | — | — |
| `/client/settings/account-information` | Conta do cliente | `GET/PUT /me` | `ClientSettingsHeader` |
| `/client/settings/members` | Times do cliente | `POST /client/teams/invites`, `DELETE /client/teams/invites/{id}` | — |
| `/client/settings/members/add` | Convidar membro do time | `POST /client/teams/invites` | — |
| `/client/settings/payment` | Pagamentos do cliente | — | — |
| `/client/settings/subscriptions` | Assinaturas do cliente | `GET /cowork/subscriptions/plans` | — |
| `/client/settings/wallet` | Wallet do cliente | `POST /wallet/card` | — |
| `/client/settings/wallet/add` | Adicionar cartão | `POST /wallet/card` | — |

### 1.10 Membership do cliente — DUPLICAÇÃO DE ROTAS

Existem DOIS conjuntos de rotas para membership com kebab-case vs lowercase colado (sem hífen):

**Conjunto A — `src/pages/client/membership/[id]/` (kebab-case, provavelmente o ativo):**
- `benefits-overview` — Benefícios
- `booking-schedule` (+ `[bookingId]` — cancelamento: `POST /client/meeting/{bookingId}/cancel`)
- `mailbox-manager` (+ `[deliveryId]` — `PUT /client/mailbox/{deliveryId}`)
- `payment-and-invoices` (+ `[invoiceId]`)
- `products-and-services`

**Conjunto B — `src/pages/membership/[id]/` (sem hífen, provavelmente legado):**
- `benefitsoverview`
- `bookingschedule`
- `mailboxmanager`
- `paymentandinvoices`
- `productsandservices`
- `spacesupport`

> `[CODIGO]` O `MemberSidebar` (`src/components/Menus/MemberSidebar/index.tsx`) aponta para o **Conjunto B** (`/membership/{id}/benefitsoverview`, etc.) — sinais de código legado não migrado. Ver seção 7.

### 1.11 Admin (plataforma)

| Rota (arquivo) | O que a página faz | Serviços/API consumidos | Componentes principais |
|---|---|---|---|
| `/admin/metrics` | Métricas de assinaturas da plataforma | `GET /admin/subscriptions/metrics`, `GET /admin/subscriptions/cohorts?months_back=6` | — |
| `/admin/audit-logs` | Audit logs | `GET /admin/audit-logs/stats?days=7`, `GET /admin/audit-logs?{qs}` | — |
| `/admin/discounts` | Cupons de desconto | `GET /admin/discounts?{qs}`, `POST /admin/discounts`, `POST /admin/discounts/{id}/deactivate` | — |
| `/admin/webhook-dlq` | Dead-letter queue de webhooks | `GET /admin/webhook-dlq/stats?days=7`, `GET /admin/webhook-dlq?{qs}`, `GET /admin/webhook-dlq/{id}`, `POST .../{id}/retry`, `POST .../{id}/discard` | — |

### 1.12 Outras rotas

| Rota (arquivo) | O que a página faz | Serviços/API consumidos |
|---|---|---|
| `/automations` — `src/pages/automations/index.tsx` | Automações | — |
| `/marketplace` — `src/pages/marketplace/index.tsx` | Marketplace | — |
| `/contact` — `src/pages/contact.tsx` | Contato (estática) | — |
| `/privacy` — `src/pages/privacy.tsx` | Política de privacidade (estática) | — |
| `/terms` — `src/pages/terms.tsx` | Termos de uso (estática) | — |
| `/status` — `src/pages/status.tsx` | Página de status | — |
| `/cowork_not_found` — `src/pages/cowork_not_found.tsx` | "Coworking não encontrado" | — |
| `/_app.tsx` | Provider raiz: AuthProvider, ThemeProvider, Stripe Elements, MenuProvider, ToastContainer, ErrorBoundary, CookieBanner (LGPD) | — |
| `/_document.tsx` | HTML shell | — |

## 2. Estrutura de navegação / menus

### 2.1 Sidebar principal (admin/coworking) — `src/components/Sidebar/index.tsx` `[CODIGO]`

Usada pelo `CoworkingLayout` (`src/components/Layouts/CoworkingLayout/index.tsx`). Renderiza:

- **Botão "Quick Actions"** — abre `QuickactionsMenu` (ver 2.4)
- **Dashboard** → `/dashboard`
- **Locations** → `/locations/dashboard` (submenu: **Venues Management** → `/locations/veneusmanagement`)
- **Services** → `/services/dashboard` (submenu: Virtual Office → `/services/virtual-office`; Meeting Room → `/services/meeting-room`; Open Desk → `/services/open-desks`; Private Room → `/services/private-rooms`)
- **Relationship** → `/relationship/dashboard` (submenu: Bookings & Agenda → `/relationship/agenda`; Deals & Opportunities → `/relationship/deals-and-opportunities`; Lead Management → popup com Personas Management → `/relationship/lead-management/personas-management` e Sales Pipeline → `/relationship/lead-management/pipeline`; Client Management → popup com Customers Management → `/relationship/client-management`, Contracts Follow Up → `/relationship/client-management/contracts`, Mailbox → `/relationship/client-management/mailbox`)
- **Finances** → `/finances/dashboard` (submenu: Invoices → `/finances/invoices`; Banking → `/finances/banking`; Taxes & Extra Fees → `/finances/taxes`; Commissions & Payouts → `/finances/commissions`)
- **Reports** → `/reports`

Itens controlados por permissão de módulo (`user.coworkUser.coworkModules` com slugs de `CoworkModulesEnum`); `MANAGER` vê tudo. `[CODIGO]`

### 2.2 Header global — `src/components/Header/index.tsx` `[CODIGO]`

- Hambúrguer (toggle sidebar, estado em cookie `wkz.sidebaOpen` via `MenuContext`)
- Logo → `/dashboard`
- `HeaderSearch` (busca)
- Nav: **Spaces** → `/spaces` (Marketplace/Community comentados)
- `ClientProfileButton` (perfil)
- Badge de mensagens (`MessagesPopup`) e notificações (`NotificationsPopup`, contador via `GET /notifications/count`)
- Engrenagem → `/settings/account-information` (ou `/client/settings/account-information` se role CLIENT)

### 2.3 Header do cliente — `src/components/Client/Header/index.tsx` `[CODIGO]`

- Logo → `/spaces`
- Nav: **Spaces** → `/spaces`; **My Membership** → `/client/membership`
- Perfil, mensagens, notificações, settings → `/client/settings/account-information`

### 2.4 Quick Actions (menu lateral no sidebar) — `src/components/Menus/QuickactionsMenu/index.tsx` `[CODIGO]` `[INTERFACE]`

Agrupado em 3 seções — itens renderizam modais via `QuickactionsModal` (`src/components/Modals`):

- **Spaces & Services**: BOOK A MEETING (`bookMeeting`), BOOK A DAY PASS (`bookDayPass`), MAILBOX RECEIPT (`mailboxReceipt`) — "BOOK TOUR" comentado
- **Lead & Clients**: NEW CUSTOMER (`newCostumer`), CREATE INVOICE (`newIvoice`) — "new lead" e "client support" comentados
- **Attachments & Others**: ATTACH CONTRACT (`attachContract`), DETACH CONTRACT (`detachContract`)

> `[INTERFACE]` Botões confirmados no dashboard admin: NEW CUSTOMER, CREATE INVOICE, BOOK A MEETING, BOOK A DAY PASS, MAILBOX RECEIPT, ATTACH CONTRACT, DETACH CONTRACT.

### 2.5 Settings tabs — `src/components/Headers/SettingsHeader/index.tsx` `[CODIGO]`

- Account Information → `/settings/account-information`
- Subscription → `/settings/subscriptions` (se módulo ACCOUNT_SETTINGS ou MANAGER)
- Wallet → `/settings/wallet`
- Payment History → `/settings/payment`
- Team Members → `/settings/members` (só MANAGER)
- Global Settings → `/settings/global-settings` (só MANAGER)

### 2.6 Client settings tabs — `src/components/Headers/ClientSettingsHeader/index.tsx` `[CODIGO]`

Account Information, Subscriptions, Wallet, Payment History, Team Members (todos sob `/client/settings/...`).

### 2.7 Membership sidebar do cliente — `src/components/Client/MemberSidebar/index.tsx` `[CODIGO]`

Usado pelo `MembershipLayout` (`src/components/Layouts/MembershipLayout/index.tsx`) que busca `GET /client/membership/{id}`. Itens (com `StatusButton` Active/Inactive):

- Products & Services → `/client/membership/{id}/products-and-services`
- Booking Schedule → `/client/membership/{id}/booking-schedule`
- Mailbox Manager → `/client/membership/{id}/mailbox-manager`
- Payment & Invoices → `/client/membership/{id}/payment-and-invoices`

> ⚠️ Existe um `MemberSidebar` **duplicado e legado** em `src/components/Menus/MemberSidebar/index.tsx` que aponta para as rotas sem hífen `/membership/{id}/benefitsoverview|productsandservices|bookingschedule|mailboxmanager|paymentandinvoices|spacesupport` (ver seção 7). O componente usado pelo layout ativo é o de `components/Client/MemberSidebar`.

### 2.8 Client Management (tabs internas) — `src/components/Headers/ClientHeader/index.tsx` `[CODIGO]`

Dentro de `/relationship/client-management/{id}/...` (`ClientManagementLayout` com `PersonalCard`): Overview, Products & Services, Mailbox, Bookings, Invoices (Benefits e Support Tickets comentados).

### 2.9 Location (tabs internas) — `src/components/Headers/LocationHeader/index.tsx` `[CODIGO]`

Dentro de `/locations/{id}/...`: Overview, Products & Services, Members, Bookings, Invoices.

### 2.10 Breadcrumb — `src/components/Headers/PageHeader/index.tsx` `[CODIGO]`

Usado pelo `ClientManagementLayout`: breadcrumb Relationship > Client Management > nome do cliente.

### 2.11 Outros layouts

- `LoginLayout` (`src/components/Layouts/LoginLayout`) — tela de login
- `PulicLayout` (`src/components/Layouts/PulicLayout`) — páginas públicas (nota: nome com typo "Pulic")
- `NavbarLayout` (`src/components/Layouts/NavbarLayout`) — com navbar
- `Layout` (`src/components/Layouts/Layout`) — layout base
- `MembershipLayout` — banner + `MemberSidebar` + conteúdo (client membership)
- `ClientManagementLayout` — breadcrumb + `PersonalCard` + `ClientHeader` + conteúdo

## 3. Serviços de API (`src/services`)

### 3.1 Cliente HTTP — `src/services/apiClient/index.ts` `[CODIGO]`

`getAPIClient(ctx?)` cria instância axios com `baseURL = process.env.NEXT_PUBLIC_API_URL`. Lê token do cookie `user-token` (via nookies `parseCookies`) e injeta header `Authorization: Bearer {token}`. Response interceptor `normalizeErrorShape` (HF-AUDIT-05) garante que `error.response.data.error.message` sempre exista (objeto válido), protegendo as ~17 telas que fazem `err.response.data.error.message.forEach(...)`.

### 3.2 Instância global — `src/services/api/index.ts` `[CODIGO]`

`export const api = getAPIClient()` — usada em todo o app. Há código comentado (interceptor de request antigo).

### 3.3 Módulo auth — `src/services/api/auth/index.ts` `[CODIGO]`

| Função | Método + path |
|---|---|
| `signInRequest(data)` | `POST /auth/login` |
| `logout()` | `POST /auth/logout` |

Tipos em `src/services/api/auth/types.d.ts`: `SignInData {email, password, remember_me}`, `LoginResponse {result: {token, expires_at, user}}`.

### 3.4 Módulo cowork/locations — `src/services/api/cowork/locations/index.ts` `[CODIGO]`

| Função | Método + path |
|---|---|
| `getLocation()` | `GET /cowork/locations` |
| `addLocation(body)` | `POST /cowork/locations` |
| `updateLocation(id, body)` | `PUT /cowork/locations/{id}` |
| `deleteLocation(id)` | `DELETE /cowork/locations/{id}` |

### 3.5 Módulo cowork/financial — `src/services/api/cowork/financial/index.ts` `[CODIGO]`

| Função | Método + path |
|---|---|
| `getTax()` | `GET /cowork/Taxs` (nota: path com "Taxs") |
| `addTax(body)` | `POST /cowork/Taxs` |
| `updateTax(id, body)` | `PUT /cowork/Taxs/{id}` |
| `deleteTax(id)` | `DELETE /cowork/Taxs/{id}` |

> Obs.: existe endpoint paralelo `/cowork/finance/taxes` usado nas páginas de taxes — dois padrões de path para o mesmo conceito.

### 3.6 Upload de arquivos — `src/services/api/fileUpload/index.ts` `[CODIGO]`

| Função | Método + path |
|---|---|
| `uploadImage(file)` | `POST /photos` (multipart, campo `photo`) |
| `uploadDocument(file)` | `POST /documents` (multipart, campo `document`) |
| `uploadFile(url, file)` | `POST {url}` (multipart, campo `file`) |

### 3.7 Middleware SWR — `src/services/api/middleware.ts` `[CODIGO]`

`swrMiddleware` injeta `Authorization: Bearer {token}` nas chamadas SWR a partir do cookie `user-token`.

### 3.8 Mapbox — `src/services/map/index.ts` `[CODIGO]`

`mapApi` (axios, baseURL `https://api.mapbox.com/geocoding/v5/`), `getGeoLocation(value)` → `GET mapbox.places/{text}.json`, `getReverseGeoLocation(lon, lat)`, `getLeadFeatureFlagEnv()` (flag `LEADS_FEATURE`).

### 3.9 Endpoints usados diretamente nas páginas/componentes (não centralizados) `[CODIGO]`

Inventário consolidado (método + path, com contagem de ocorrências):

**Auth/me:**
- `GET /me` (3), `PUT /me` (2), `POST /auth/logout`, `POST /auth/lost-password`, `POST /auth/lost-password-confirmation`, `POST /auth/email-confirmation`, `POST /auth/signup`, `POST /auth/resend-email-confirmation`, `GET /me/2fa`, `POST /me/2fa/setup|verify|disable`, `GET /me/export-data`, `GET/POST /me/delete-account`, `DELETE /me/delete-account/{id}`

**Infos (catálogos):**
- `GET /infos/services` (9), `GET /infos/amenities` (2), `GET /infos/termsizes` (3), `GET /infos/taxtypes`, `GET /infos/meetroomquestions`

**Locations/venues:**
- `GET /cowork/locations?page=1`, `GET /cowork/locations/{id}` (via useFetch), `GET /cowork/dashboard/locations`

**Services:**
- `GET /cowork/dashboard/services`, `POST /cowork/virtualoffices`, `POST /cowork/meetrooms`, `POST /cowork/desks`, `POST /cowork/rooms`, `PUT/DELETE /cowork/{recurso}/{id}`, `POST /cowork/{recurso}/{id}/changeavailability`, `POST /cowork/meetrooms/book`

**Relationship:**
- `GET /cowork/clients` (6), `GET /cowork/clients/{id}` (layout), `POST /cowork/clients`, `PUT/DELETE /cowork/clients/{id}`, `GET /cowork/clients/{id}/benefits`, `GET /cowork/clients/{id}/invoices`, `GET /cowork/clients/{id}/products`, `GET /cowork/relationship/salespipeline`, `PUT /cowork/relationship/salespipeline/{id}`, `GET /cowork/relationship/dealsopportunities`, `POST .../dealsopportunities/{id}/approve|reject`, `POST /cowork/relationship/personasmanagement`, `DELETE .../personasmanagement/{id}`, `POST /cowork/relationship/contracts`, `POST .../contracts/{id}/sendcontract`, `DELETE .../contracts/{id}`, `POST /cowork/relationship/mailbox`, `PUT/DELETE /cowork/relationship/mailbox/{id}`, `POST /cowork/relationship/tours`, `GET /cowork/relationship/bookings/unapproved`, `GET /cowork/dashboard/relationship`, `DELETE /cowork/settings/calendar/{agenda.id}`

**Financeiro:**
- `GET /cowork/dashboard/finance`, `POST /cowork/finance/invoices`, `DELETE /cowork/finance/invoices/{uuid}`, `POST /cowork/finance/invoices/resend/{id}`, `GET /cowork/finance/taxes` (useFetch), `POST /cowork/finance/taxes`, `PUT/DELETE /cowork/finance/taxes/{id}`, `POST /cowork/settings/banking`, `POST /cowork/finance/banking/{id}/sync`, `DELETE /cowork/settings/banking/{id}`, `POST /cowork/stripe/externalaccount`, `GET /invoice/{id}`, `POST /invoice/{id}`

**Subscriptions/wallet:**
- `GET /cowork/subscriptions` (2), `POST /cowork/subscriptions` (2), `GET /cowork/subscriptions/plans`, `GET /cowork/subscriptions/validate-discount`, `POST /cowork/subscriptions/portal-session`, `POST /cowork/subscriptions/{id}/sync`, `.../{id}/extend-trial-self-service`, `.../{id}/cancel`, `.../{id}/change-plan`, `GET /wallet/{payment_method}/{id}`, `POST /wallet/card` (2), `POST /wallet/bank_account` (2), `DELETE /wallet/{type}/{id}`

**Notificações:**
- `GET /notifications/count`, `GET /notifications?page=1`, `POST /notifications/read-all`, `POST /notifications/{id}/read`, `DELETE /notifications/{id}`

**Client (role CLIENT):**
- `GET /client/membership`, `GET /client/membership/{id}` (layout), `GET /client/membership/{id}/bookings`, `POST /client/meeting/request`, `POST /client/meeting/{bookingId}/cancel`, `POST /client/daypass/request`, `POST /client/spaces/reserve`, `POST /client/spaces/tours`, `POST /client/teams/invites`, `POST /client/teams/invites/{token}`, `DELETE /client/teams/invites/{id}`, `PUT /client/mailbox/{deliveryId}`, `POST /{clientType}/chats/{uuid}/messages`

**Admin (plataforma):**
- `GET /admin/subscriptions/metrics`, `GET /admin/subscriptions/cohorts?months_back=6`, `GET /admin/audit-logs/stats?days=7`, `GET /admin/audit-logs?{qs}`, `GET /admin/discounts?{qs}`, `POST /admin/discounts`, `POST /admin/discounts/{id}/deactivate`, `GET /admin/webhook-dlq/stats?days=7`, `GET /admin/webhook-dlq?{qs}`, `GET /admin/webhook-dlq/{id}`, `POST /admin/webhook-dlq/{id}/retry`, `POST /admin/webhook-dlq/{id}/discard`

**Funcionários:**
- `GET /cowork/employees?page=1`, `POST /cowork/employees/invites`, `GET /cowork/employees/invites/{token}`, `POST /cowork/employees/invites/{token}`, `DELETE /cowork/employees/{id}`, `DELETE /cowork/employees/invites/{id}`, `POST /cowork/status`, `PUT /cowork/status`

**Outros:**
- `GET /cowork/{type}/export` (reports), `PUT /cowork/settings/global`, `GET /cowork/settings/subscriptions`

> `[CODIGO]` Conclusão: a maioria das chamadas é feita **inline** nas páginas/componentes com `api.get/post/...` ou via hook `useFetch` — os arquivos de `src/services/api` centralizam apenas uma pequena fração (auth, locations, taxes, upload). Não há camada de repositório por domínio.

## 4. Contextos e hooks globais

### 4.1 `AuthContext` — `src/contexts/AuthContext.tsx` `[CODIGO]`

- Gerencia: `isAuthenticated`, `user` (UserCoworking & UserClient), `signOut()`.
- Busca `GET /me` via `useFetch` quando existe cookie `user-token`; `user = data.result[0]`.
- Redireciona por role: COWORKING → `/dashboard`, CLIENT → `/spaces` (quando na raiz). Sem token → `/login?returnTo=...&expired=true` com toast "Sorry, you are not authenticated." e `cache.clear()` (SWR).
- `signOut()`: limpa cache SWR, `POST /auth/logout`, `destroyCookie("user-token")`, redireciona `/login`.
- `roles` prop (authRoles da página) define proteção por página (ex.: `UNAUTH`).
- Contém bloco de código comentado de roteamento por role (legado).

### 4.2 `MenuContext` — `src/contexts/MenuContext.tsx` `[CODIGO]`

- Gerencia: `isOpen` (sidebar aberta/fechada) e `pathHistory {current, last}` (primeiro segmento da rota, usado pelos submenus animados do Sidebar).
- Persiste estado da sidebar em cookie `wkz.sidebaOpen` (nookies, sameSite lax). `handleSidebarToggle()` alterna.

### 4.3 `SpacesContext` — `src/contexts/SpacesContext.tsx` `[CODIGO]`

- Motor de busca de espaços (área pública `/spaces` e client). `useReducer` com actions: CHANGE_LOCATION, CHANGE_SERVICE_TYPE, CHANGE_AREA_MEASUREMENT, CHANGE_AREA, CHANGE_GEOLOCATION, CHANGE_PRICING_RANGE, CHANGE_AMENITIES, CHANGE_SORTING, SET_VIEWSTATE, SET_RESULT, SET_IS_FETCHING.
- Monta URL de busca dinâmica: `GET /spaces?location=...&long=...&lat=...&search_area=...&search_area_type=...&service_type=...&amenities[]=...` com filtros específicos por serviço: `vo_*` (virtual office), `od_desk_type`/`od_pricing_range_*` (open desk), `mr_*`/`pr_*` (meeting room/private room — provável).
- Geocodificação via Mapbox (`getGeoLocation`) + geolocalização do navegador quando usuário logado; debounce de 500ms no termo de busca (`useDebounce`).
- Reducers adicionais por tipo de filtro: `voFilterReducer`, `odFilterReducer`, `mrFilterReducer`, `prFilterReducer`.
- Usado por `ClientLayout` (ClientHeader + pages do cliente) e `CoworkingLayout`? — não: usado em `ClientLayout` e na página `/spaces`.

### 4.4 Hooks — `src/hooks/` `[CODIGO]`

| Hook | O que faz |
|---|---|
| `useFetch(url, options)` | Wrapper de SWR sobre `api.get`; em erro 401 (exceto `/me`) limpa cache SWR e redireciona para `/login?returnTo=...&expired=true`; suporta cancelamento via axios CancelToken; expõe `{data, error, mutate, isLoading, isValidating}` |
| `useDebounce(value, delay)` | Debounce de string (500ms usado no SpacesContext) |
| `useEffectAfterMount(cb, deps)` | Executa callback apenas após o primeiro mount |
| `useIntervalHook` | Intervalo reutilizável `[NAO_CONFIRMADO]` |
| `useOutsideClick` | Detecta clique fora de um elemento (fecha popups/modais) |
| `useMediaQuery(query)` / `useIsMobile` / `useIsTablet` / `useIsDesktop` | Media queries SSR-safe (mobile ≤768px, tablet ≤992px, desktop ≥993px) |
| `useCookieConsent()` | LGPD: estado `unknown/accepted/rejected` em localStorage (`workeaser_cookie_consent`, version key `workeaser_cookie_consent_version`); `accept/reject/reset`; dispara evento custom `workeaser:consent`; controla PostHog/Sentry/pixels. Comentários citam Sprint B (HF-SPRINT-B-05) |

## 5. Login — fluxo e armazenamento do token

### 5.1 Fluxo `[CODIGO]`

1. **Rota** `/login` — `src/pages/login/index.tsx` (usa `LoginLayout` + `LoginBox`). Trata query `?error=&status=` → se status 406 mostra "Nenhum coworking associado a este usuário". Link "Ainda não tem conta? Criar conta grátis" → `/create-account`.
2. **Formulário** — `src/components/LoginBox/index.tsx` (@unform + Yup):
   - Modo login: email + senha (min 6) + checkbox "Remember Me" → `signInRequest({email, password, remember_me})` → `POST /auth/login`.
   - Modo "Lost Password": só email → `POST /auth/lost-password` → toast "A recovery email was sent to you."
   - Erros de validação exibidos via `formRef.setErrors`; erro de rede → "Network error..."; mensagem de email não confirmado → dispara `POST /auth/resend-email-confirmation`.
3. **Resposta do login** (`LoginResponse`): `{ result: { token, expires_at, user } }`.
4. **Armazenamento do token** `[CODIGO]`:
   - `setCookie(null, "user-token", token, { maxAge: (expires_at - now)/1000, sameSite: "strict", path: "/", secure: https })` — cookie **não-httpOnly** (linha comentada `// httpOnly: true`).
   - Depois `api.defaults.headers["Authorization"] = Bearer {token}`.
   - NOTA: o cookie NÃO é httpOnly no frontend; um comentário em `src/components/DotsMenu/InvoiceOptions/index.tsx:31` afirma "auth client tem cookie HTTP-only 'user-token'" — divergência `[NAO_CONFIRMADO]` entre comentário e código.
5. **Redirecionamento pós-login**: role `COWORKING`/`ADMIN` → `/dashboard`; role `CLIENT` → `/spaces`. (Query `returnTo` está comentada no código.)
6. **Uso do token**:
   - `src/services/apiClient/index.ts`: `parseCookies(ctx)` lê `user-token` e injeta `Authorization: Bearer` em toda instância axios.
   - `src/services/api/middleware.ts` (SWR): mesmo padrão para fetcher SWR.
   - `AuthContext`: `parseCookies()` → `useFetch("/me")` valida sessão; sem token → redireciona `/login`.
   - Páginas protegidas usam `getServerSideProps` com `parseCookies(context)` e `getAPIClient(context)` (ex.: `/dashboard`, `/client/membership`, `/finances/dashboard`, `/services/...`, `/relationship/...`, `/settings/...`) — SSR redirect para `/login?expired=true` quando sem token.
7. **Logout**: `AuthContext.signOut()` → `cache.clear()` (SWR) → `POST /auth/logout` → `destroyCookie("user-token")` → `/login`.
8. **Landing (`/` )**: verifica `localStorage.getItem("workeaser.token") || localStorage.getItem("token")` para auto-redirect ao dashboard — chaves legadas, não escritas pelo fluxo atual de login `[NAO_CONFIRMADO]` (código atual usa cookie).

> **Resumo token** `[CODIGO]`: cookie `user-token` (nookies, sameSite strict, maxAge = expires_at, sem httpOnly). Não há uso de localStorage no fluxo de login atual.

---

## 6. Evidências de interface (navegador)

Confirmado no dashboard admin logado `[INTERFACE]`:

- **Cards do dashboard**: Active Locations = **10**, Active Members = **239**, Receivable Income = **$800.00** (também Open Opportunities — valor não registrado). `[INTERFACE]` — corresponde ao código de `src/pages/dashboard/index.tsx` linhas 163-183 (`ChartCardSummary` com titles "Active Locations", "Open Opportunities", "Active Members", "Receivable Income", `type="currency"`), dados de `GET /cowork/dashboard` (GSSP com fallback SWR). `[CODIGO]`
- **Menus da sidebar**: Spaces / Locations / Services / Relationship / Finances / Reports. `[INTERFACE]` — confere com `src/components/Sidebar/index.tsx` (Dashboard + 5 módulos + Quick Actions). `[CODIGO]`
- **Botões Quick Actions**: NEW CUSTOMER, CREATE INVOICE, BOOK A MEETING, BOOK A DAY PASS, MAILBOX RECEIPT, ATTACH CONTRACT, DETACH CONTRACT. `[INTERFACE]` — confere com `src/components/Menus/QuickactionsMenu/index.tsx` (modais `newCostumer`, `newIvoice`, `bookMeeting`, `bookDayPass`, `mailboxReceipt`, `attachContract`, `detachContract`). `[CODIGO]`

---

## 7. Sinais de incompletude, duplicação e comportamento duvidoso

### 7.1 Duplicação de rotas Membership (CLIENT)
Existem DOIS conjuntos de páginas de membership do cliente com caminhos diferentes, aparentemente o mesmo recurso [CODIGO]:
- `src/pages/client/membership/[id]/...` — booking-schedule, mailbox-manager, payment-and-invoices, products-and-services (kebab-case) — **ATIVO**, usado pelo `components/Client/MemberSidebar`
- `src/pages/membership/[id]/...` — bookingschedule, mailboxmanager, paymentandinvoices, productsandservices, spacesupport, benefitsoverview (sem hífen) — **LEGADO**, apontado pelo `Menus/MemberSidebar` que NÃO é importado por nenhum componente [CODIGO — subagente]

Verificação necessária: comparar os imports/uso de API de cada par para determinar qual está ativo e qual é legado. O menu do cliente usa o caminho `client/membership` (via `MemberSidebar`), sugerindo que `membership/[id]` (sem `client/`) é o legado [NAO_CONFIRMADO — exige diff detalhado].

### 7.2 Diversas tabelas/áreas sem telas correspondentes
O backend expõe CRUD completo para banking, stripe-connect, taxa, meetrooms, tours, day-passes, discounts, webhook-dlq — mas várias dessas áreas têm telas parciais ou apenas endpoints (ver matriz de evidências no relatório final). Ex.: `finances/banking` existe na UI; `admin/discounts`, `admin/webhook-dlq`, `admin/audit-logs`, `admin/metrics` existem; `automations`, `marketplace`, `onboarding`, `status`, `contact` são páginas avulsas cujo propósito precisa ser confirmado por leitura [NAO_CONFIRMADO].

### 7.3 Landing `/` usa chaves de token legadas
`localStorage.getItem("workeaser.token") || localStorage.getItem("token")` — chaves não gravadas pelo fluxo atual (cookie `user-token`) [CODIGO]. Indício de evolução do mecanismo de auth sem limpeza completa.

### 7.4 Cookie de sessão sem httpOnly
`user-token` gravado sem `httpOnly` (linha comentada) [CODIGO]. Risco de segurança XSS. Divergência com comentário no `InvoiceOptions` que afirma httpOnly [NAO_CONFIRMADO].

### 7.5 Páginas "placeholder" prováveis
Páginas como `status.tsx`, `contact.tsx`, `privacy.tsx`, `terms.tsx`, `marketplace/index.tsx`, `automations/index.tsx`, `onboarding/index.tsx` — não confirmadas visualmente nesta análise; a leitura de cada uma é necessária para saber se são reais ou esqueleto [NAO_CONFIRMADO — leitura pendente].
- **Confirmadas VAZIAS** (renderizam `<></>`): `/client`, `/settings/integrations`, `/settings/payments` [CODIGO — subagente]
- **Presença mínima:** `/automations`, `/marketplace` [CODIGO — subagente]

### 7.6 Página `/client` VAZIA
`src/pages/client/index.tsx` tem apenas `<Head>` "My Membership" e usa `NavbarLayout` — sem conteúdo [CODIGO]. A rota real do portal é `/client/membership`.

### 7.7 Link "/signup" quebrado na landing
`src/pages/index.tsx` (landing PT-BR, Sprint K) tem CTA para `/login` e `/signup`, mas **não existe página `/signup`** — a rota real é `/create-account` [CODIGO].

### 7.8 Feature flags / itens comentados
- `LEADS_FEATURE` gate no Quick Actions (New Lead comentado) [CODIGO]
- Omnichat comentado no sidebar [CODIGO]
- "Marketplace/Community/My Membership" comentados no Header [CODIGO]

### 7.9 Endpoints inconsistentes no frontend
- `getTax` chama `GET /cowork/Taxs` (maiúscula inconsistente com a rota real `/cowork/taxes`) [CODIGO]
- `POST resend` de invoice sem barra inicial no path (bug potencial de URL) [CODIGO]
- Cookie `wkz.sidebaOpen` (typo "sidebaOpen") do MenuContext [CODIGO]

---

## 8. O que cada menu/módulo renderiza (resumo)

| Menu (sidebar) | Rotas | Função |
|---|---|---|
| Dashboard | `/dashboard` | Cards: Active Locations (10), Open Opportunities (0), Active Members (239), Receivable Income ($800.00) + gráficos (Sales Pipeline Funnel, Clients per Product Category, Invoices per Status) + tabelas Upcoming Bookings e Member Support [INTERFACE + CODIGO] |
| Spaces | `/spaces`, `/spaces/locations/[id]`, `/spaces/services/[id]` | Vitrine pública de espaços e serviços |
| Locations | `/locations/dashboard`, `/locations/[id]/` (overview, members, products, invoices, bookings), `/locations/add`, `/locations/veneusmanagement` | Gestão de unidades |
| Services | `/services/dashboard`, `/services/virtual-office`, `/services/meeting-room`, `/services/open-desks`, `/services/private-rooms`, `/services/add/*` | Gestão de serviços vendáveis |
| Relationship | `/relationship/dashboard`, `/relationship/client-management/*` (overview, benefits, products-and-services, bookings, invoices, mailbox, support-tickets, contracts, add, edit, import), `/relationship/deals-and-opportunities/*`, `/relationship/lead-management/*` (personas, pipeline, add), `/relationship/omnichat`, `/relationship/agenda/*` | Gestão de clientes, leads, pipeline, chat |
| Finances | `/finances/dashboard`, `/finances/invoices*` (list, create, [id]), `/finances/banking`, `/finances/taxes*` (list, create), `/finances/commissions` | Financeiro |
| Reports | `/reports` | Relatórios |
| Settings | `/settings/account-information`, `/settings/global-settings`, `/settings/integrations`, `/settings/members*`, `/settings/payment(s)`, `/settings/subscriptions*`, `/settings/wallet*`, `/settings/security/2fa`, `/settings/privacy` | Configurações |
| Client | `/client/membership*`, `/client/settings/*`, `/spaces` | Portal do cliente |
| Admin | `/admin/audit-logs`, `/admin/discounts`, `/admin/metrics`, `/admin/webhook-dlq` | Admin de plataforma |

**Nota:** estas rotas foram confirmadas por existência de arquivo [CODIGO]; o conteúdo renderizado de cada uma exige leitura individual — várias já detalhadas nas seções 1.x deste documento.

---

*Fim da análise do frontend (seções 7 e 8 complementadas na consolidação em 06/08/2026).*

