# Workeaser — Banco de Dados (06)

> **Data:** 06/08/2026 — Modo 100% leitura (SELECT/SHOW apenas)
> **Evidências:** [BANCO] = confirmado por query

---

## 1. Tecnologia e conexão

| Item | Valor | Evidência |
|---|---|---|
| SGBD | MySQL 8.4 | [CONFIG — compose] |
| Banco | workeaser_local | [BANCO] |
| Host/porta | workeaser-mysql:3306 (host 3307) | [CONFIG] |
| Usuário | workeaser (dev) | [CONFIG — env-pc/*.env] |
| Migrations | 289 em adonis_schema | [BANCO] |
| Tabelas | 108 | [BANCO] |
| Views/Triggers/Procedures | Não identificados | [NAO_CONFIRMADO] |
| FKs declaradas | 7 | [BANCO] |
| Soft delete | deleted_at em quase todos os models | [CODIGO + BANCO] |

## 2. Distribuição (27 com dados / 81 vazias)

### 2.1 Tabelas com dados
| Tabela | Linhas | Conteúdo |
|---|---|---|
| users | 244 | 5 ADMIN + 1 COWORKING + 238 CLIENT |
| api_tokens | 114 | Tokens OAT |
| cowork_accounts | 1 | Easy WorkSpace Orlando |
| cowork_users | 6 | 6 MANAGERs |
| cowork_clients | 240 | vínculos user→cowork |
| client_accounts | 240 | empresas (239 QBO + Acme) |
| cowork_modules | 6 | Locations, Services, Relationship, Finances, Reports, Account Settings |
| cowork_user_modules | 42 | permissões por usuário |
| client_modules | 6 | Benefits, Products, Booking, Mailbox, Payment, Space Support |
| locations | 10 | Unit Neptune/Moon/Saturn/Venus/Mars/Mercury/Uranus/Earth/Jupiter/Pluto |
| addresses | 11 | Orlando FL (32801/32835) |
| services | 4 | VO, MR, OD, PR |
| amenities | 18 | catálogo |
| location_amenities | 2 | |
| virtual_offices | 7 | Basic $49 ... Executive $399, Annual $100 |
| virtual_office_prices | 7 | MONTH_1/YEAR_1 |
| meetrooms | 5 | BB-8, C-3PO, R2-D2, Empire, Jedi Council |
| meetroom_questions | 7 | whiteboard, display, etc. |
| meetroom_answers | 21 | respostas do meetroom 3 |
| meetroom_photos | 12 | |
| desks | 4 | Mesa Fixa 01/02, Hot Desk AM/PM |
| room_prices | 3 | |
| subscription_plans | 3 | Solo, Growth, Network |
| photos | 28 | user 194 |
| logs | 150 | AUTH LOGIN_SUCCESS |

### 2.2 Tabelas vazias (81) — núcleo operacional nunca usado
**Financeiro:** invoices, invoice_items, invoice_item_fees, invoice_item_fee_taxes, invoice_activities, invoice_contracts, invoice_payment_histories, payments, payment_histories, payment_history_initial_fees, subscriptions, initial_fees, taxes, tax_services, discount_codes, discount_redemptions
**Contratos:** contracts, contract_activities, contract_documents, contract_notifications, contract_renewals, contract_usages
**Reservas/Operação:** meetings, meeting_billings, meeting_taxes, day_passes, day_pass_taxes, tours, mailboxes, mailbox_histories, space_reserve_requests
**Comercial:** leads, lead_opportunities, teams, team_members, team_member_invites, team_member_invite_locations, team_member_invite_capabilities, team_member_locations
**Banking:** bank_accounts, bank_account_transactions, linked_bank_accounts, cards
**Comunicação:** chats, chat_messages, message_attachments, message_photos, message_videos, whatsapp_messages, notifications, email_queue
**Admin:** partners, partner_api_tokens, admin_audit_logs
**Uploads:** videos, documents
**Outros:** cowork_settings, cowork_external_accounts, cowork_stripe_accounts, client_account_modules, employee_invites, employee_invite_capabilities, employee_invite_locations, employee_locations, events, notes, data_deletion_requests, user_email_activations, user_lost_passwords, user_integrations, calendar_integrations, webhook_dead_letter_queue, location_photos, location_services, desk_fees, desk_photos, desk_prices, room_fees, room_photos, virtual_office_fees, virtual_offices_photos, mailbox_photos, meetroom_photos (12 tem)

## 3. Relacionamentos principais

- users → cowork_users → cowork_accounts (1)
- users → cowork_clients → cowork_accounts
- client_accounts ↔ users (vínculo por email — SEM FK)
- cowork_accounts → locations (10) → addresses
- locations → virtual_offices (7, todos na location 4) → virtual_office_prices
- locations → meetrooms (5) → meetroom_answers → meetroom_questions
- locations → desks (4), rooms (0) → room_prices (3)
- subscription_plans (3) → subscriptions (0)
- FKs declaradas (7): chat_messages→chats/users, chats→client_accounts/cowork_accounts, discount_redemptions→discount_codes, partner_api_tokens→partners, subscriptions→subscription_plans

## 4. Inconsistências e riscos [BANCO]

| # | Problema | Risco |
|---|---|---|
| 1 | Meetroom price: 5500 (BB-8 etc.) vs 350/800 (Empire/Jedi) — unidade inconsistente (centavos vs dólares) | Cobrança errada |
| 2 | ~20 clientes com email composto por vírgula (herança QBO) | Login quebrado (VALIDATION_ERROR) |
| 3 | users 244 vs client_accounts 240 vs cowork_clients 240 — vínculo frouxo sem FK | Órfãos |
| 4 | 7 FKs apenas — maioria das relações sem integridade de constraint | Órfãos em escrita direta |
| 5 | Virtual offices todos na location 4 | 9 unidades sem produtos |
| 6 | rooms 0 com room_prices 3 | Dados órfãos |
| 7 | addresses.fulltext/fulltext2 (fulltext é palavra reservada) | Queries problemáticas |
| 8 | 81 tabelas vazias | Sistema sem operação real |
| 9 | photos (28) do user 194 (Rogerio) | Possível seed/teste |
| 10 | Campos de auditoria: created_at/updated_at/deleted_at presentes; sem versionamento de registro (sem optimistic lock) | Concorrência |
| 11 | Dados sensíveis: password com hash argon2id; email/telefones PII em claro | LGPD — necessidade de cuidado (tarefa de exclusão existe) |

## 5. Comparação models vs migrations

- Models: 108; migrations aplicadas: 289. Coerência não verificada linha a linha [NAO_CONFIRMADO] — mas o admin-api declara models como "mirror read-only" das tabelas do workeaser-api, indicando que as tabelas são criadas por um único schema (workeaser-api) [CODIGO].
- O admin-api tem apenas 4 migrations próprias (partners, partner_api_tokens, add_role, admin_audit_logs) [CODIGO — database/migrations].
