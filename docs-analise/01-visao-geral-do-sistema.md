# Workeaser — Documentação do Sistema (01 — Visão Geral)

> **Data:** 06/08/2026
> **Modo da análise:** 100% leitura (código-fonte, banco, rotas, telas). Nenhuma alteração feita durante a documentação.
> **Fonte do código:** `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\src\`
> **Evidência:** [CODIGO] = confirmado no código; [INTERFACE] = confirmado em navegador; [BANCO] = confirmado por query; [NAO_CONFIRMADO] = não foi possível confirmar; [RUNTIME] = confirmado em execução/logs.

---

## Resumo executivo

O **Workeaser** é uma plataforma de gestão de coworking em desenvolvimento, composta por 3 aplicações: **workeaser-api** (API principal, AdonisJS 5), **admin-api** (API administrativa interna, AdonisJS 5) e **workeaser-frontend** (Next.js). O sistema roda localmente via Docker Desktop no PC (4 containers) e está populado com dados reais da **Easy Work Space Orlando** (10 unidades, 240 clientes importados do QBO, 7 planos de Virtual Office).

**Situação real:** o sistema está funcionando como aplicação navegável (login + dashboard admin confirmados em navegador), mas **não está em produção** e a grande maioria das funções operacionais **não tem dados** — 81 das 108 tabelas estão vazias, incluindo tabelas centrais como `invoices`, `contracts`, `payments`, `meetings`, `leads`. O conselho de especialistas (council 27/07 e 04/08) concluiu que o sistema é um "protótipo sem congregação" — a prioridade é robustez técnica (credenciais, VPS, CI/CD), não novas funcionalidades.

---

## 1. Visão geral do sistema

### 1.1 Objetivo
Sistema de gestão para espaços de coworking: cadastro de unidades (locations), venda de serviços (Virtual Office, Meeting Room, Open Desk, Private Room), gestão de clientes, contratos, faturas, pagamentos, reservas (meetings/day pass), caixa postal (mailbox), leads e pipeline de vendas, relatórios financeiros e comunicação (chat, WhatsApp, notificações).

### 1.2 Problema que resolve
Substituir planilhas e processos manuais na operação de escritórios virtuais e coworking: unificar clientes, cobrança, contratos, reservas e relatórios num único sistema com portal para o cliente.

### 1.3 Tipos de usuários

| Role | Quem é | Acesso |
|---|---|---|
| ADMIN | Donos/gestores da plataforma (Roger, Marcela, Eneide, Claudio, Administrator) | Tudo do cowork + páginas admin da plataforma |
| COWORKING | Operador/gestor do espaço de coworking (demo@workeaser.com) | Módulos do cowork (dashboard, locations, services, relationship, finances, reports, settings) |
| CLIENT | Empresas clientes (240 importadas do QBO + Acme demo) | Portal do cliente (membership, bookings, invoices, mailbox, chat) |
| PARTNER (admin-api) | Parceiros internos do admin-api (sistema separado) | Admin interno: partners CRUD, listar coworkings/clients, suspender usuários |

### 1.4 Como o sistema está estruturado

```
workeaser-frontend (Next.js, porta 3005)
        │  HTTP/JSON (axios + SWR)
        ▼
workeaser-api (AdonisJS 5, porta 3333)  ──►  MySQL 8.4 (porta 3307, 108 tabelas)
        ▲
admin-api (AdonisJS 5, porta 3334) ────────┘  (mesmo banco, tabelas compartilhadas)
```

- 3 apps independentes, 1 banco MySQL compartilhado
- Auth por bearer token OAT (tabela `api_tokens` / `partner_api_tokens`)
- Frontend Next.js com SSR (getServerSideProps) + SWR no cliente
- 4 containers Docker: workeaser-frontend, workeaser-api, workeaser-admin-api, workeaser-mysql

### 1.5 Tecnologias, serviços e integrações

| Camada | Tecnologia |
|---|---|
| Backend | AdonisJS 5 (TypeScript), Lucid ORM, Auth OAT, Bouncer (RBAC), adonis5-scheduler, Drive S3 |
| Frontend | Next.js, TypeScript, SWR, axios, Chart (echarts), Mapbox, Stripe.js |
| Banco | MySQL 8.4 (108 tabelas, 289 migrations) |
| Infra | Docker Desktop (compose.pc.yml), PC local |

| Integração | Estado |
|---|---|
| Stripe (pagamentos) | Implementado no código; env com chave de TESTE (sk_test_local) [CODIGO] |
| Stripe Connect | Implementado (onboarding, external accounts) [CODIGO] |
| Stripe Subscriptions | Implementado (plans, portal, cancel, change-plan) [CODIGO] |
| Plaid (banking) | Implementado; env com placeholder [CODIGO] |
| WhatsApp Meta Cloud | Implementado (envio de mensagens) [CODIGO] |
| Docusign (eSignature) | Implementado; env com placeholder [CODIGO] |
| AdobeSign | Implementação parcial; env parcialmente configurado [CODIGO] |
| BoldSign | Implementado mas QUEBRADO em runtime (Invalid URL nos logs) [RUNTIME] |
| Google Calendar | OAuth implementado; env com placeholder [CODIGO] |
| Exchange/Outlook | OAuth implementado; env com placeholder [CODIGO] |
| AWS SES (email) | Implementado (fila de email); env local-dev [CODIGO] |
| Mapbox | Chave local (pk.local...) [CODIGO] |
| QBO (QuickBooks) | NÃO é integração do sistema — clientes foram IMPORTADOS via script (import-qbo-customers.py) numa única carga [BANCO] |

### 1.6 Como os dados entram, são processados, armazenados e exibidos

1. **Entrada**: formulários do frontend (Next.js) → POST/PUT via axios para a API; importações CSV (clients, desks, locations, meetrooms, rooms, virtual-offices); importação em massa de usuários (AuthController.import); webhooks externos (Stripe, Docusign, SES, WhatsApp, BoldSign, AdobeSign).
2. **Processamento**: controllers → services (camada de negócio) → validators (schema do Adonis); pagamentos via Stripe (charge/capture/refund); contratos via eSignature; email via fila (email_queue).
3. **Armazenamento**: MySQL 8.4, 108 tabelas; soft delete em quase todos os models (deleted_at); auditoria em `logs` (workeaser-api) e `admin_audit_logs` (admin-api).
4. **Exibição**: dashboard com métricas agregadas, listagens paginadas, gráficos (echarts), relatórios (ReportsController), portal do cliente.

### 1.7 Como os módulos se relacionam

- **Locations** (10 unidades) → contêm **VirtualOffices / Meetrooms / Rooms / Desks** (por location_id)
- **Services** (4 tipos: VO, MR, OD, PR) → categorizam os produtos vendáveis
- **ClientAccounts** (240) ↔ **Users** (244) → **CoworkClients** (vínculo user↔cowork)
- **CoworkAccounts** (1: Easy WorkSpace Orlando) → raiz de tudo (locations, users, clients)
- **Invoices** → InvoiceItems → taxes/fees; Payments → InvoicePaymentHistory
- **Contracts** → ContractActivity/Notifications/Renewal/Usage
- **Subscriptions** → SubscriptionPlans (Solo/Growth/Network) → Stripe
- **Leads** → LeadOpportunities → SalesPipeline
- **Chats** → ChatMessages; **Notifications** por usuário

### 1.8 Processos automáticos vs manuais

**Automáticos (definidos no código):**
- 8 tasks agendadas (adonis5-scheduler): geração de faturas (2h), faturas vencidas (hora), reconciliação Plaid (2h), LGPD (3h), fila de email (1min), retry webhook (5min), fila WhatsApp (1min), renovação de contratos (1h)
- Webhooks: Stripe (invoice.paid, payment_failed), Docusign/BoldSign/AdobeSign (eventos de assinatura), SES (bounce/complaint), WhatsApp (mensagens)
- Evento `user:email_confirmed` → sequência de onboarding (3 emails: dia 0, 3, 7) [CODIGO]
- Auditoria automática de ações (LoggerMiddleware → tabela logs)

**⚠️ ACHADO CRÍTICO [RUNTIME]:** o container roda apenas `node server.js` — o scheduler (`node ace scheduler:run`) NÃO está sendo executado. As 8 tasks estão definidas com cron mas **nunca rodam** no ambiente atual.

**Manuais:** cadastro de clientes/locations/serviços, criação de faturas (embora exista a task automática, sem scheduler ela é manual de fato), aprovação/rejeição de bookings/day passes/tours, recebimento/captura/reembolso de pagamentos, envio de contratos para assinatura, sync bancário.

---

## 2. Fluxo geral do sistema

### Fluxo 1 — Operador (COWORKING/ADMIN)
1. Usuário acessa http://localhost:3005 → tela de login → POST /api/auth/login → bearer token (cookie `user-token`)
2. Redirect: role COWORKING/ADMIN → /dashboard
3. Dashboard mostra métricas (Active Locations 10, Active Members 239, Receivable Income $800.00) [INTERFACE]
4. Gestão diária: cadastrar cliente (NEW CUSTOMER), criar fatura (CREATE INVOICE), reservar reunião (BOOK A MEETING), day pass (BOOK A DAY PASS), caixa postal (MAILBOX RECEIPT), contratos (ATTACH/DETACH CONTRACT) [INTERFACE — Quick Actions]
5. Módulos: Locations, Services, Relationship (clientes/leads/pipeline), Finances (invoices/banking/taxes), Reports, Settings
6. Pagamentos: fatura → receber pagamento (Stripe) → registrar/capturar/reembolsar
7. Logout → POST /auth/logout → revoga token

### Fluxo 2 — Cliente (CLIENT)
1. Login → role CLIENT → /spaces
2. Portal do cliente (client/membership): beneficiários, produtos e serviços, agenda de reservas, mailbox manager, pagamentos e faturas
3. Reservar meeting (request), day pass (request/visit), consultar faturas, caixa postal
4. Pagamento público de fatura (sem login): /api/public-invoices/:uuid → pay

### Fluxo 3 — Admin de plataforma (admin-api, porta 3334)
1. POST /api/auth/login (admin-api) → token OAT em `partner_api_tokens`
2. /api/admin/dashboard → métricas; /api/admin/partners CRUD (somente SYSTEM_DIRECTOR cria/edita/deleta)
3. /api/admin/coworkings e /clients → inspeção read-only; /users/:id/suspend ou /unsuspend (soft delete em users.deleted_at)
4. Auditoria em admin_audit_logs

### Fluxo 4 — Assinatura de contrato (eSignature)
1. Operador cria contrato (ContractsController.store) → anexa documentos (attachNewDocuments)
2. Envia para assinatura (sendcontract) → integração eSignature (Docusign/AdobeSign/BoldSign)
3. Assinante assina no portal externo → webhook (docusign/boldsign/adobesign) atualiza status
4. Operador consulta status (getContractStatus) e URL pública (contractUrl)

### Fluxo 5 — Cobrança (definido no código, não executando)
1. GenerateInvoice task (2h diária) gera faturas recorrentes
2. Cliente paga → Stripe webhook invoice.paid → sincroniza estado
3. OverdueInvoice task marca vencidas → notificação
4. ⚠️ Tasks não rodam (scheduler inativo)

---

## 3. Estado por módulo (resumo)

| Módulo | Status geral | Evidência |
|---|---|---|
| Auth (login/signup/2FA/LGPD) | Concluído | [CODIGO] + login testado [INTERFACE] |
| Dashboard | Concluído (funciona) | [INTERFACE] |
| Locations | Parcial (10 unidades cadastradas; CRUD completo) | [BANCO] [CODIGO] |
| Services (VO/MR/OD/PR) | Parcial (catálogo cadastrado; operação sem dados) | [BANCO] |
| Client Management | Parcial (240 clientes; CRUD completo; sem dados operacionais) | [BANCO] [CODIGO] |
| Invoices/Finance | Presente no código, sem dados (0 faturas, 0 pagamentos) | [BANCO] |
| Contracts | Presente no código, sem dados (0 contratos) | [BANCO] |
| Meetings/Bookings | Presente no código, sem dados | [BANCO] |
| Day Pass | Presente no código, sem dados | [BANCO] |
| Mailbox | Presente no código, sem dados | [BANCO] |
| Leads/Pipeline | Presente no código, sem dados | [BANCO] |
| Reports | Presente no código (10 relatórios), sem dados | [CODIGO] |
| Banking/Plaid | Presente no código, sem dados | [BANCO] |
| Subscriptions | Parcial (3 planos cadastrados; 0 assinaturas) | [BANCO] |
| Chat | Presente no código, sem dados | [BANCO] |
| Admin (platforma) | Parcial (admin-api funcional; 0 partners) | [CODIGO] |
| Integrações pagamento | Presente no código, Stripe em modo teste | [CODIGO] |
| Tasks/background | Definidas mas NÃO executando (scheduler inativo) | [RUNTIME] |

---

*Próximo: 02-inventario-de-funcoes.md*
