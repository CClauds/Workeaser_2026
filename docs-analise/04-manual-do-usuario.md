# Workeaser — Manual Breve do Usuário (04)

> **Data:** 06/08/2026
> **Base:** funções confirmadas no código e na interface. Tudo aqui foi verificado como existente; quando uma função existe mas não tem dados/uso, isso está indicado.
> **Acesso:** http://localhost:3005 (frontend) · API: http://172.16.4.26:3333 · Admin API: http://172.16.4.26:3334

---

## 1. Como acessar o sistema

**Pré-requisitos:**
- Containers Docker rodando: `docker compose -f compose.pc.yml up -d` (em A:\Claude-Deep\Temp\workeaser-arm64\workeaser)
- Navegador

**Passo a passo:**
1. Abra http://localhost:3005
2. Aceite os cookies (botão "Aceitar todos os cookies" ou "Aceitar apenas cookies essenciais")
3. Na tela "Entrar | Workeaser", preencha:
   - Login: seu email (ex.: admin@workeaser.com)
   - Password: sua senha
4. Clique **LOG IN**

**Resultado esperado:** redireciona para o Dashboard (ADMIN/COWORKING) ou para Spaces (CLIENT).

**Possíveis erros:**
- "Email or password is incorrect" → credenciais erradas
- "Email address has not been confirmed yet" → conta não confirmada (contate o administrador)
- "Too many requests" → aguarde ~35s (rate limit)

**Como confirmar:** você vê o dashboard com os cards Active Locations / Active Members / Receivable Income.

---

## 2. Como navegar pelos menus

**Pré-requisitos:** logado como ADMIN ou COWORKING.

**Menu lateral (sidebar):**
- **Dashboard** — métricas gerais
- **Spaces** — vitrine pública de espaços e serviços
- **Locations** — gestão de unidades (Venues Management)
- **Services** — Virtual Office, Meeting Room, Open Desk, Private Room
- **Relationship** — Bookings & Agenda, Deals & Opportunities, Lead Management (Personas Management, Sales Pipeline), Client Management (Customers Management, Contracts Follow Up, Mailbox)
- **Finances** — Invoices, Banking, Taxes & Extra Fees, Commissions & Payouts
- **Reports** — relatórios

**Quick Actions (menu lateral de atalhos):**
- BOOK A MEETING, BOOK A DAY PASS, MAILBOX RECEIPT, NEW CUSTOMER, CREATE INVOICE, ATTACH CONTRACT, DETACH CONTRACT

**Resultado:** cada item abre a tela correspondente.

---

## 3. Como criar um registro (ex.: novo cliente)

**Caminho:** Quick Actions → **NEW CUSTOMER** (ou Relationship → Client Management → botão novo/add)

**Passo a passo:**
1. Clique NEW CUSTOMER (abre modal)
2. Preencha os dados da empresa (nome, email, contatos)
3. Confirme

**Resultado esperado:** cliente aparece na lista Client Management (Customers Management).

**Possíveis erros:** validação de campos obrigatórios; email duplicado.

**Como confirmar:** o cliente aparece em Relationship → Client Management.

> Nota: a criação de cliente via API é POST /api/cowork/clients [CODIGO]. Importação em massa também existe (import/export CSV).

---

## 4. Como criar um registro (ex.: local/unidade)

**Caminho:** Locations → (botão adicionar) ou /locations/add

**Passo a passo:**
1. Acesse Locations → add
2. Preencha nome (ex.: Unit Saturn), endereço, dados de contato
3. Salve

**Resultado esperado:** unidade aparece na listagem Locations (10 unidades atuais) e no dashboard (Active Locations).

**Como confirmar:** a lista de Locations mostra a nova unidade.

---

## 5. Como editar um registro

**Caminho:** varie por módulo — ex.: Locations → clique na unidade → edite; Client Management → clique no cliente → edite.

**Passo a passo:**
1. Abra o registro
2. Altere os campos desejados
3. Salve (PUT na API)

**Resultado esperado:** dados atualizados na tela.

**Como confirmar:** os campos mostram os novos valores.

---

## 6. Como excluir/arquivar

- **Clientes:** Client Management → excluir (DELETE /api/cowork/clients/:id — soft delete)
- **Locations/Services:** tela de edição → opção de exclusão (DELETE — soft delete, coluna deleted_at)
- **Contratos:** Quick Action **DETACH CONTRACT**

> ⚠️ Exclusões são lógicas (deleted_at), não físicas. Não há confirmação visual detalhada de cada fluxo de exclusão [NAO_CONFIRMADO — o código implementa soft delete].

---

## 7. Como pesquisar

- **Busca global:** campo Search no header (topo da tela) — usa GET /api/cowork/search [CODIGO]
- **Clientes:** lista de Client Management com busca (POST /api/cowork/clients/search por email) [CODIGO]
- **Paginadores** nas listagens (per_page)

**Resultado esperado:** lista filtrada pelos termos.

---

## 8. Como usar filtros

- Listagens (clientes, faturas, relatórios) têm paginação e ordenação via query string (page, per_page, search, sort, order) [CODIGO — ex.: admin-api ClientsController]
- Relatórios: seleção de período/produto conforme cada relatório [NAO_CONFIRMADO — leitura da tela pendente]

---

## 9. Operações principais

### 9.1 Criar fatura
1. Quick Action **CREATE INVOICE** (modal) ou Finances → Invoices → criar
2. Selecione cliente, itens (descrição, quantidade, preço), vencimento
3. Confirme → fatura criada (POST /api/cowork/invoices)
4. Reenvio por email: tela da fatura → reenviar (POST /invoices/resend/:id)
5. PDF: GET /invoices/:id/pdf

> ⚠️ Não há faturas criadas no banco ainda (0 invoices) — fluxo pronto no código.

### 9.2 Receber pagamento
- Na fatura: receber pagamento (POST /invoices/receivepayment/:id), capturar (capturepayment), reembolsar (refundpayment)
- Página pública de pagamento: /invoice-payment/[id] (cliente paga sem login)

### 9.3 Reservar meeting (operador)
1. Quick Action **BOOK A MEETING**
2. Escolha meetroom (BB-8, C-3PO, R2-D2, The Empire, Jedi Council), data/horário
3. Confirme → POST /api/cowork/meetrooms/book
4. Aprovação: lista de bookings → approve/reject

### 9.4 Day pass
- Quick Action **BOOK A DAY PASS** → POST /api/cowork/day-pass → approve/reject

### 9.5 Caixa postal (mailbox)
- Quick Action **MAILBOX RECEIPT** → POST /api/cowork/mailbox; gestão em Relationship → Client Management → Mailbox

### 9.6 Contrato
- Quick Actions **ATTACH CONTRACT / DETACH CONTRACT** → POST /api/cowork/contracts; envio para assinatura (sendcontract) via eSignature

### 9.7 Sync bancário
- Finances → Banking → sincronizar (POST /banking/:id/sync) — integração Plaid; sem dados atuais

---

## 10. Como consultar relatórios

**Caminho:** Reports (menu lateral) → relatórios disponíveis.

**Backend (10 endpoints):** approvedbookings, contractrenewals, daypasseslisting, invoicesoverview, leadslisting, memberslisting, revenuebylocation, revenuebymember, visitorslisting [CODIGO].

**Resultado esperado:** tabelas/gráficos dos dados filtrados.

> ⚠️ Relatórios sem dados no momento (tabelas operacionais vazias) — as telas carregam com "No data".

---

## 11. Portal do cliente (role CLIENT)

**Caminho:** após login (CLIENT) → /spaces → portal em /client/membership

**Abas do membership:**
- Benefits Overview (benefícios)
- Products & Services (produtos e serviços)
- Booking Schedule (agenda de reservas)
- Mailbox Manager (caixa postal)
- Payment & Invoices (pagamentos e faturas)
- Space Support (suporte)

**Ações do cliente:** reservar reunião (request), day pass (request/visit), ver faturas, convidar membros da equipe, chat.

> ⚠️ Também existem rotas duplicadas /membership/[id]/... (sem "client/") — recurso aparentemente duplicado; use o caminho /client/membership.

---

## 12. Como corrigir erros comuns

| Erro | Causa provável | Correção |
|---|---|---|
| "Email or password is incorrect" | Senha/email errados | Verifique credenciais; admin padrão: admin@workeaser.com |
| "Email address has not been confirmed yet" | email_confirmed=0 | Administrador marca email confirmado no banco (UPDATE users SET email_confirmed=1) |
| "Too many requests" | Rate limit (35s) | Aguarde e tente de novo |
| "Failed to fetch" / login não envia | CORS | CORS_ALLOWED_ORIGINS deve incluir http://localhost:3005 no env da API + restart |
| The email is not valid | Cliente com email composto (vírgula) do QBO | Normalizar email no banco (usar só o primeiro) |
| Tela em branco / API fora | Container parado | `docker compose -f compose.pc.yml up -d` |

---

## 13. Como sair do sistema

**Passo a passo:**
1. Clique no menu do usuário (avatar/canto) → opção de sair
2. Confirme → POST /api/auth/logout → cookie removido → volta ao /login

**Como confirmar:** você está na tela de login novamente.

---

## 14. Admin de plataforma (admin-api — porta 3334)

**Pré-requisitos:** credencial de PARTNER (criada por SYSTEM_DIRECTOR); não há UI dedicada confirmada — acesso via API (curl/Postman) [NAO_CONFIRMADO — sem UI encontrada no frontend].

**Operações (API):**
- POST /api/auth/login → token
- GET /api/admin/dashboard → métricas
- GET /api/admin/partners | POST/PUT/DELETE (SYSTEM_DIRECTOR)
- GET /api/admin/coworkings, /clients
- POST /api/admin/users/:id/suspend | /unsuspend

---

*Fim do manual. Funções marcadas como sem dados estão implementadas mas sem uso real até 06/08/2026.*
