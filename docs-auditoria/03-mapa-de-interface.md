# Workeaser — Mapa de Interface (03)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] = arquivo em src/pages ou src/components · [INTERFACE] = confirmado em navegador · [NAO_CONFIRMADO]

---

## 1. Layouts globais

| Layout | Componente | Uso |
|---|---|---|
| CoworkingLayout | src/components/Layouts/CoworkingLayout (Header + Sidebar) | dashboard, locations, services, relationship, finances, reports, settings, admin |
| ClientLayout | src/components/Layouts/ClientLayout (ClientHeader, sem sidebar) | /spaces, /client |
| MembershipLayout | Banner + MemberSidebar | /client/membership/[id]/* |
| LoginLayout | — | login, create-account, lost-password |
| NavbarLayout | — | landing, client |
| SettingsLayout | — | settings |
| ClientManagementLayout | — | client-management |
| PulicLayout | — | páginas públicas |

## 2. Menus e navegação (sidebar — src/components/Sidebar/index.tsx)

Itens filtrados por `user.coworkUser.coworkModules` (permissões por módulo) ou role MANAGER [CODIGO]:

| Menu | Rota | Submenu |
|---|---|---|
| Dashboard | /dashboard | — |
| Locations | /locations/dashboard | Venues Management (/locations/veneusmanagement) |
| Services | /services/dashboard | Virtual Office, Meeting Room, Open Desk, Private Room |
| Relationship | /relationship/dashboard | Bookings & Agenda (/relationship/agenda), Deals & Opportunities, Lead Management (Personas Management + Sales Pipeline em popup), Client Management (Customers Management + Contracts Follow Up + Mailbox em popup); **Omnichat comentado** |
| Finances | /finances/dashboard | Invoices, Banking, Taxes & Extra Fees, Commissions & Payouts |
| Reports | /reports | — |

**Quick Actions** (botão lateral — src/components/Menus/QuickactionsMenu/index.tsx) [CODIGO + INTERFACE]:
- BOOK A MEETING, BOOK A DAY PASS, MAILBOX RECEIPT, NEW CUSTOMER, CREATE INVOICE, ATTACH CONTRACT, DETACH CONTRACT
- New Lead comentado (feature flag LEADS_FEATURE)

**Header** (src/components/Header/index.tsx): logo → /dashboard, link Spaces, perfil, chat (MessagesPopup), sino de notificações (GET /notifications/count), settings.

**SettingsHeader:** Account Information, Subscription, Wallet, Payment History; Team Members + Global Settings só para MANAGER; gate módulo ACCOUNT_SETTINGS.

**MemberSidebar (cliente):** Products & Services, Booking Schedule, Mailbox Manager, Payment & Invoices.

## 3. Mapa de páginas (~130 rotas)

### 3.1 Públicas / autenticação
| Rota | Arquivo | Função |
|---|---|---|
| / | src/pages/index.tsx | Landing PT-BR (Sprint K); CTA /login e /signup (**/signup não existe — quebrado**) |
| /login | login/index.tsx | LoginBox (Login, Password, Remember Me, LOG IN, Lost Password?, Criar conta grátis) |
| /create-account | create-account/index.tsx | Signup (nome, telefone, email, senha, papel COWORKING/CLIENT) → POST /auth/signup |
| /create-account/[token] | create-account/[token].tsx | Aceita convite de equipe |
| /verify-email/[token] | verify-email/[token].tsx | POST /auth/email-confirmation |
| /lost-password/[token] | lost-password/[token].tsx | POST /auth/lost-password-confirmation |
| /invoice-payment/[id] | invoice-payment/[id].tsx | Pagamento público de fatura (Stripe CardElement) |
| /accept-invitation/[token] | accept-invitation/[token].tsx | Convite de funcionário |
| /new-client/[token] | new-client/[token].tsx | Confirmação de email pós-signup |
| /contact, /privacy, /terms, /status | estáticos | Páginas institucionais |
| /cowork_not_found | — | Erro: usuário sem cowork associado |

### 3.2 Portal do cliente
| Rota | Função |
|---|---|
| /spaces | Busca de espaços com mapa Mapbox (SpacesContext: localização, serviço, área, preço, amenities) |
| /spaces/locations/[id] | Detalhe de coworking |
| /spaces/services/[id] | Página de reserva (996 linhas): POST /client/spaces/reserve, /client/meeting/request |
| /client | ⚠️ VAZIA (só <Head> "My Membership") |
| /client/membership | Lista memberships (cards) |
| /client/membership/[id]/products-and-services | Produtos e serviços |
| /client/membership/[id]/booking-schedule (+[bookingId]) | Agenda; cancelar POST /client/meeting/[bookingId]/cancel |
| /client/membership/[id]/mailbox-manager (+[deliveryId]) | Caixa postal; PUT /client/mailbox/[deliveryId] |
| /client/membership/[id]/payment-and-invoices (+[invoiceId]) | Pagamentos e faturas |
| /client/settings/account-information | PUT /me |
| /client/settings/members (+/add) | Membros de equipe |
| /client/settings/payment, /subscriptions, /wallet (+/add) | Pagamento, assinaturas, carteira (POST /wallet/card, /wallet/bank_account) |

### 3.3 Dashboards
| Rota | Função | API |
|---|---|---|
| /dashboard | Cards (Active Locations 10, Open Opportunities 0, Active Members 239, Receivable Income $800.00) + gráficos gauge/funnel/pie + tabelas | GET /cowork/dashboard [INTERFACE] |
| /locations/dashboard | Sunburst + Spaces Occupancy | GET /cowork/dashboard/locations |
| /services/dashboard | Upcoming Bookings, Upcoming Renewals | GET /cowork/dashboard/services |
| /relationship/dashboard | LTV, ARPU, funnel, sunburst | GET /cowork/dashboard/relationship |
| /finances/dashboard | Cash flow, income/expenses + botão "Criar Fatura" | GET /cowork/dashboard/finance |

### 3.4 Locations
| Rota | Função |
|---|---|
| /locations/dashboard | Painel de filiais |
| /locations/[id]/overview, /members, /products, /invoices, /bookings | Abas da unidade (LocationHeader) |
| /locations/add | Nova unidade |
| /locations/veneusmanagement | Venues Management |

### 3.5 Services
| Rota | Função |
|---|---|
| /services/dashboard | Painel |
| /services/virtual-office, /meeting-room, /open-desks, /private-rooms | Listagens por tipo |
| /services/add/virtual-office, /meeting-room, /open-desk, /private-room | Cadastro de produto |

### 3.6 Relationship
| Rota | Função |
|---|---|
| /relationship/dashboard | Painel |
| /relationship/client-management | Lista de clientes (busca, filtros) |
| /relationship/client-management/add, /edit | Novo/editar cliente |
| /relationship/client-management/import | Importação |
| /relationship/client-management/contracts | Contratos |
| /relationship/client-management/mailbox (+/[id]) | Caixa postal |
| /relationship/client-management/[id]/overview, /benefits, /products-and-services, /bookings, /invoices, /mailbox, /support-tickets | Abas do cliente (ClientHeader) |
| /relationship/deals-and-opportunities (+/[id]) | Oportunidades |
| /relationship/lead-management/add, /personas-management, /pipeline | Leads/personas/pipeline |
| /relationship/omnichat | Chat (comentado no menu) |
| /relationship/agenda (+/[id]) | Agenda |

### 3.7 Finances
| Rota | Função |
|---|---|
| /finances/dashboard | Painel |
| /finances/invoices (+/create, /[id]) | Faturas |
| /finances/banking | Banking |
| /finances/taxes (+/create) | Impostos |
| /finances/commissions | Comissões |

### 3.8 Reports
| Rota | Função |
|---|---|
| /reports | Relatórios (10 endpoints backend) |

### 3.9 Settings (coworking)
| Rota | Função |
|---|---|
| /settings/account-information | Dados da conta |
| /settings/global-settings | Config global |
| /settings/integrations | ⚠️ VAZIA (renderiza <></>) |
| /settings/members (+/add) | Equipe |
| /settings/payment, /payments | ⚠️ /payments VAZIA |
| /settings/subscriptions (+/manage, /upgrade) | Assinaturas |
| /settings/wallet (+/add) | Carteira |
| /settings/security/2fa | 2FA |
| /settings/privacy | Privacidade/LGPD |

### 3.10 Admin (plataforma)
| Rota | Função |
|---|---|
| /admin/audit-logs | Auditoria (chama workeaser-api /admin/audit-logs) |
| /admin/discounts | Descontos |
| /admin/metrics | Métricas de subscriptions |
| /admin/webhook-dlq | Fila morta de webhooks |

### 3.11 Outras
| Rota | Função |
|---|---|
| /automations | Presença mínima |
| /marketplace | Presença mínima |
| /onboarding | Onboarding |
| /membership/[id]/* (sem "client/") | ⚠️ LEGADO duplicado de /client/membership/[id]/* |

## 4. Modais (Quick Actions — src/components/Modals/index.tsx)

BookMeeting, DayPass, MailboxReceipt, NewCostumer, NewInvoice, AttachContract, DetachContract [CODIGO].

## 5. Estados de carregamento/vazio/erro

- Carregamento: padrão SWR (skeleton/spinner por componente) [NAO_CONFIRMADO detalhe]
- Vazio: tabelas com "No data" (confirmado no dashboard: Upcoming Bookings e Member Support) [INTERFACE]
- Erro: interceptor de erro HF-AUDIT-05 no apiClient; 401 → redirect /login?expired=true [CODIGO]

## 6. Telas condicionadas por perfil

| Perfil | Acesso |
|---|---|
| ADMIN/COWORKING | Sidebar completa + Quick Actions |
| CLIENT | /spaces + /client/membership + /client/settings (MemberSidebar) |
| ADMIN (plataforma) | /admin/* |

**Nota:** o frontend oculta /admin/* para CLIENT, mas a verificação efetiva é do backend (middleware adminAuthorization). Casos em que a UI oculta mas o backend não impede: a UI filtra itens do sidebar por cowork_modules, mas se o backend não tiver o middleware de módulo na rota, o acesso por URL direta pode passar — verificar rota a rota na matriz de permissões (07).
