# Análise Técnica — Banco de Dados Workeaser (MySQL 8.4)

> **Banco:** `workeaser_local` no container Docker `workeaser-mysql` (porta 3307)
> **Credenciais (dev local):** workeaser / workeaser_dev [CODIGO — env-pc/*.env]
> **Evidência:** queries SELECT/SHOW via docker exec (modo read-only). Marcação [BANCO].
> **Data da coleta:** 06/08/2026

---

## 1. Inventário geral

- **108 tabelas** [BANCO — information_schema]
- **289 registros em adonis_schema** (migrations aplicadas) [BANCO]
- **27 tabelas com dados** (table_rows > 0); **81 tabelas vazias** [BANCO]
- **Apenas 7 FKs declaradas** (constraints) — a maioria das relações é lógica via ORM (Lucid), sem FK no banco [BANCO — information_schema.key_column_usage]

### FKs declaradas (7 no total)

| Tabela | Coluna | Referencia |
|---|---|---|
| chat_messages | chat_id | chats.id |
| chat_messages | from_user_id | users.id |
| chats | client_account_id | client_accounts.id |
| chats | cowork_account_id | cowork_accounts.id |
| discount_redemptions | discount_code_id | discount_codes.id |
| partner_api_tokens | partner_id | partners.id |
| subscriptions | subscription_plan_id | subscription_plans.id |

---

## 2. Tabelas por domínio

### 2.1 Auth / Usuários
| Tabela | Linhas | Conteúdo |
|---|---|---|
| users | 244 | 5 ADMIN + 1 COWORKING + 238 CLIENT (240 QBO + Acme) — colunas: id, first_name, middle_name, last_name, email, password (argon2id), email_confirmed, role, personal_phone, uuid, timestamps, soft delete [BANCO] |
| api_tokens | 114 | Tokens OAT por user (194: 38, 1: 37, 2: 15, 243/244: 5...) [BANCO] |
| user_email_activations | 0 | Ativação de email |
| user_lost_passwords | 0 | Reset de senha |
| user_integrations | 0 | Integrações do user |
| data_deletion_requests | 0 | LGPD |

### 2.2 Cowork (raiz do negócio)
| Tabela | Linhas | Conteúdo |
|---|---|---|
| cowork_accounts | 1 | **Easy WorkSpace Orlando** (demo@workeaser.com) — o único cowork operando [BANCO] |
| cowork_users | 6 | Vínculo user→cowork: demo, admin, marcelarobens, eneidechiarotti, claudiocaballero, rogeriochiarotti — todos MANAGER [BANCO] |
| cowork_clients | 240 | Vínculo user→cowork (user_id 3..242) [BANCO] |
| cowork_modules | 6 | Locations, Services, Relationship, Finances, Reports, Account Settings [BANCO] |
| cowork_user_modules | 42 | Permissões de módulo por cowork_user [BANCO] |
| cowork_settings | 0 | Configurações do cowork |
| cowork_external_accounts | 0 | Contas externas Stripe Connect |
| cowork_stripe_accounts | 0 | Contas Stripe do cowork |

### 2.3 Clientes
| Tabela | Linhas | Conteúdo |
|---|---|---|
| client_accounts | 240 | Empresas clientes (company_name, company_email) — 239 importadas do QBO + Acme. Ex.: 2911 The Suites Society, MedStation, Trust Solution [BANCO] |
| client_account_modules | 0 | Módulos por cliente |
| client_modules | 6 | Benefits Overview, Products & Services, Booking Schedule, Mailbox Manager, Payment & Invoices, Space Support [BANCO] |

### 2.4 Localizações e serviços
| Tabela | Linhas | Conteúdo |
|---|---|---|
| locations | 10 | Unit Neptune/Moon/Saturn/Venus/Mars/Mercury/Uranus/Earth/Jupiter/Pluto — endereços reais EWS Orlando (2295 S Hiawassee Rd e 2121 S Hiawassee Rd; Venus em 6996 Piazza Grande Ave) [BANCO] |
| addresses | 11 | Endereços (Orlando FL, zipcodes 32801/32835) — colunas fulltext/fulltext2 (campo fulltext é palavra reservada MySQL) [BANCO] |
| services | 4 | Virtual Office (VO), Meeting Room (MR), Open Desk (OD), Private Room (PR) [BANCO] |
| amenities | 18 | Bike Parking, Coffee, Kitchen, Pet Friendly, etc. [BANCO] |
| location_amenities | 2 | location_id 1 → amenities 1,2,3 [BANCO] |
| location_photos / location_services | 0 / 0 | Fotos e serviços por local |

### 2.5 Serviços vendáveis
| Tabela | Linhas | Conteúdo |
|---|---|---|
| virtual_offices | 7 | Basic $49, Standard $69, Growing Company $99, Premium $149, Enterprise $349, Executive $399, Annual $100/mês ($1200/ano) — todos na location 4 (Unit Saturn) [BANCO] |
| virtual_office_prices | 7 | monthly/full price por duração (MONTH_1, YEAR_1) [BANCO] |
| meetrooms | 5 | BB-8 (price 5500, 220m², 6p), C-3PO, R2-D2, The Empire - Training Room (350, 20p), Jedi Council - Conference Hall (800, 50p) — note: price 5500 parece em centavos vs 350/800 em dólares (inconsistência) [BANCO] |
| meetroom_questions | 7 | whiteboard, display, drink/food permitido, ADA, multimedia, supplies [BANCO] |
| meetroom_answers | 21 | Respostas do meetroom 3 às 7 questões (todas 0) [BANCO] |
| meetroom_photos | 12 | Fotos |
| desks | 4 | Mesa Fixa 01/02, Hot Desk Manhã/Tarde (location 4) [BANCO] |
| rooms | 0 | Salas privadas (estrutura pronta, sem dados) |
| room_prices | 3 | Preços de salas |

### 2.6 Financeiro (TODAS VAZIAS — exceto planos)
| Tabela | Linhas | Observação |
|---|---|---|
| invoices | 0 | **Nenhuma fatura criada** [BANCO] |
| invoice_items, invoice_item_fees, invoice_item_fee_taxes, invoice_activities, invoice_contracts, invoice_payment_histories | 0 | Sub-recursos |
| payments, payment_histories, payment_history_initial_fees | 0 | Pagamentos |
| subscriptions | 0 | Assinaturas ativas (tabela vazia!) |
| subscription_plans | 3 | Solo, Growth, Network [BANCO] |
| taxes, tax_services | 0 | Impostos |
| initial_fees | 0 | Taxas iniciais |
| bank_accounts, bank_account_transactions, linked_bank_accounts | 0 | Banking (Plaid) |
| discounts: discount_codes, discount_redemptions | 0 | Descontos |

### 2.7 Operacional (TODAS VAZIAS)
| Tabela | Linhas |
|---|---|
| contracts, contract_activities, contract_documents, contract_notifications, contract_renewals, contract_usages | 0 |
| meetings, meeting_billings, meeting_taxes | 0 |
| day_passes, day_pass_taxes | 0 |
| mailboxes, mailbox_histories | 0 |
| tours | 0 |
| leads, lead_opportunities | 0 |
| teams, team_members, team_member_invites, team_member_locations, team_member_invite_capabilities, team_member_invite_locations | 0 |
| events | 0 |
| notes | 0 |
| employee_invites, employee_invite_capabilities, employee_invite_locations, employee_locations | 0 |
| space_reserve_requests | 0 |
| cards | 0 |
| space_reserve_requests | 0 |

### 2.8 Chat / Comunicação (VAZIAS)
| Tabela | Linhas |
|---|---|
| chats, chat_messages, message_attachments, message_photos, message_videos | 0 |
| whatsapp_messages | 0 |
| notifications | 0 |
| email_queue | 0 |

### 2.9 Auditoria / Webhooks
| Tabela | Linhas | Conteúdo |
|---|---|---|
| logs | 150 | Auditoria de ações — AUTH LOGIN_SUCCESS com _ip e _ua (ex.: curl, Chrome) [BANCO] |
| admin_audit_logs | 0 | Auditoria admin |
| webhook_dead_letter_queue | 0 | DLQ webhooks |

### 2.10 Outros
| Tabela | Linhas |
|---|---|
| photos | 28 | Fotos de users (user 194 = Rogerio) |
| videos | 0 |
| documents | 0 |
| partners, partner_api_tokens | 0 |
| cowork_users → módulos | 42 vínculos |

---

## 3. Relacionamentos principais (lógicos, via ORM)

- `users` (1) → (N) `cowork_users` (user_id) — vínculo com cowork
- `users` (1) → (N) `client_accounts`? — NÃO há FK direta; client_accounts tem company_email, e users tem email (vínculo lógico por email + id 3..242 em cowork_clients.user_id) [BANCO]
- `cowork_accounts` (1) → (N) `cowork_users`, `cowork_clients`, `locations` (cowork_account_id)
- `locations` (1) → (N) `virtual_offices`, `meetrooms`, `rooms`, `desks` (location_id)
- `virtual_offices` (1) → (N) `virtual_office_prices`
- `users` (1) → (N) `api_tokens` (user_id)
- `users` (1) → (N) `logs` (user_id)
- `cowork_users` (1) → (N) `cowork_user_modules` (cowork_user_id) → cowork_modules
- `client_accounts` (1) → (N) `client_account_modules` → client_modules

---

## 4. Inconsistências encontradas [BANCO]

1. **users 244 vs client_accounts 240 vs cowork_clients 240**: 244 users = 240 CLIENT (QBO) + Acme (CLIENT) + 2 COWORKING (admin/demo) + ... na verdade 5 ADMIN + 1 COWORKING + 238 CLIENT = 244; client_accounts 240 inclui Acme; cowork_clients 240 com user_id 3..242. As contagens fecham porém os vínculos são frouxos (sem FK user↔client_account).
2. **Meetroom price inconsistente**: BB-8/C-3PO/R2-D2 têm price 5500 (centavos?) enquanto Training Room 350 e Conference Hall 800 (dólares). Unidade inconsistente entre registros.
3. **Emails compostos com vírgula** nos clientes QBO (ex.: `medstation.adm@gmail.com, finance@brazilianclinic.com`) — quebram a validação de email no login (confirmado por teste: VALIDATION_ERROR "The email is not valid"). ~20 casos.
4. **81 tabelas vazias**: estrutura de 108 tabelas para um sistema que só tem dados de catálogo (locations, serviços, preços) e users — nenhum dado operacional (0 invoices, 0 contracts, 0 meetings, 0 payments).
5. **Tabela `addresses`** usa coluna `fulltext` (palavra reservada) e `fulltext2` — duplicação aparente.
6. **photos com user 194** (Rogerio) — 28 fotos, provavelmente seed de teste.
7. **virtual_offices todos na location 4** (Unit Saturn) — os outros 9 locations não têm serviços vendáveis cadastrados.
8. **rooms (Private Room) e room_prices**: 3 preços mas 0 rooms.
9. **discounts / taxes / banking / leads / teams / contracts**: módulos completos no código com 0 registros — prontos para uso, nunca usados.

---

## 5. Matriz "pronto para uso" vs "nunca usado"

**COM DADOS (uso real ou seed):** users, api_tokens, cowork_accounts, cowork_users, cowork_clients, cowork_modules, cowork_user_modules, client_accounts, client_modules, locations, addresses, services, amenities, location_amenities, virtual_offices, virtual_office_prices, meetrooms, meetroom_questions, meetroom_answers, meetroom_photos, desks, room_prices, subscription_plans, photos, logs.

**ESTRUTURA CRIADA, SEM DADOS (nunca usadas):** invoices + sub-tabelas, payments, subscriptions, contracts + sub-tabelas, meetings, day_passes, mailboxes, tours, leads, teams, events, notes, bank_accounts, linked_bank_accounts, taxes, discounts, cards, chats, whatsapp_messages, notifications, email_queue, webhook_dead_letter_queue, admin_audit_logs, documents, videos, partners, space_reserve_requests, data_deletion_requests, user_email_activations, user_lost_passwords, user_integrations, cowork_settings, cowork_external_accounts, cowork_stripe_accounts, client_account_modules, employee_invites.
