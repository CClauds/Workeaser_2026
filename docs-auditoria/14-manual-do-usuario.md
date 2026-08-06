# Workeaser — Manual do Usuário (14)

> **Data:** 06/08/2026 — Funções confirmadas. Nomes reais de menus/botões.
> **Acesso:** http://localhost:3005

---

## 1. Acessar o sistema
- **Perfil:** todos
- **Pré-requisitos:** containers rodando (`docker compose -f compose.pc.yml up -d`)
- **Passos:** abrir http://localhost:3005 → aceitar cookies → preencher Login + Password → clicar **LOG IN**
- **Resultado:** dashboard (ADMIN/COWORKING) ou Spaces (CLIENT)
- **Erros:** "Email or password is incorrect" (credenciais); "Email address has not been confirmed yet" (contatar admin); "Too many requests" (aguardar ~35s)
- **Confirmar:** vê os cards Active Locations / Active Members / Receivable Income

## 2. Navegar pelos menus
- **Perfil:** ADMIN/COWORKING
- **Menu lateral:** Dashboard · Spaces · Locations (Venues Management) · Services (Virtual Office, Meeting Room, Open Desk, Private Room) · Relationship (Bookings & Agenda, Deals & Opportunities, Lead Management, Client Management) · Finances (Invoices, Banking, Taxes & Extra Fees, Commissions & Payouts) · Reports
- **Quick Actions:** BOOK A MEETING, BOOK A DAY PASS, MAILBOX RECEIPT, NEW CUSTOMER, CREATE INVOICE, ATTACH CONTRACT, DETACH CONTRACT
- **Confirmar:** cada item abre a tela correspondente

## 3. Criar um cliente
- **Perfil:** ADMIN/COWORKING
- **Caminho:** Quick Actions → **NEW CUSTOMER** (ou Relationship → Client Management)
- **Passos:** abrir modal → preencher dados da empresa → confirmar
- **Campos:** nome da empresa, email, contatos
- **Resultado:** cliente na lista Client Management
- **Erros:** validação de obrigatórios; email duplicado
- **Confirmar:** cliente aparece em Relationship → Client Management

## 4. Criar uma localização (unidade)
- **Caminho:** Locations → adicionar (ou /locations/add)
- **Passos:** preencher nome (ex.: Unit Saturn), endereço, contato → salvar
- **Resultado:** unidade na lista + conta em Active Locations
- **Confirmar:** lista de Locations mostra a nova unidade

## 5. Criar fatura
- **Caminho:** Quick Actions → **CREATE INVOICE** (ou Finances → Invoices)
- **Passos:** selecionar cliente → itens (descrição, quantidade, preço) → vencimento → confirmar
- **Ações:** reenviar por email (resend), PDF, receber pagamento
- **⚠️** Nenhuma fatura existe ainda no sistema (0 invoices) — fluxo pronto no código

## 6. Reservar reunião (operador)
- **Caminho:** Quick Actions → **BOOK A MEETING**
- **Passos:** escolher meetroom (BB-8, C-3PO, R2-D2, The Empire, Jedi Council) → data/horário → confirmar
- **Aprovação:** lista de bookings → approve/reject
- **⚠️** 0 reservas no banco

## 7. Day pass / Mailbox
- **BOOK A DAY PASS** → POST /api/cowork/relationship/daypass → approve/reject
- **MAILBOX RECEIPT** → POST /api/cowork/relationship/mailbox → gestão em Client Management → Mailbox
- **⚠️** 0 registros

## 8. Contrato
- **ATTACH CONTRACT / DETACH CONTRACT** (Quick Actions) → contratos em Relationship → Contracts Follow Up
- Envio para assinatura via eSignature (Docusign/BoldSign) — ⚠️ BoldSign quebrada
- **⚠️** 0 contratos

## 9. Portal do cliente
- **Perfil:** CLIENT
- **Caminho:** após login → /spaces → /client/membership
- **Abas:** Products & Services, Booking Schedule, Mailbox Manager, Payment & Invoices
- **Ações:** reservar reunião (request), day pass (request/visit), faturas, equipe, chat

## 10. Relatórios
- **Caminho:** Reports
- **⚠️** Sem dados no momento — telas mostram "No data"

## 11. Sair
- Clicar no perfil (canto) → opção de sair → confirma → volta ao /login

## 12. Erros comuns e correção

| Erro | Causa | Correção |
|---|---|---|
| Email or password is incorrect | credenciais | verificar; admin: admin@workeaser.com |
| Email not confirmed yet | email_confirmed=0 | admin marca no banco (UPDATE users SET email_confirmed=1) |
| Too many requests | rate limit 35s | aguardar |
| Failed to fetch / login não envia | CORS | adicionar porta do frontend em CORS_ALLOWED_ORIGINS + restart |
| The email is not valid | email composto (vírgula) do QBO | normalizar email no banco |

## 13. Admin de plataforma (admin-api :3334)
- **Perfil:** PARTNER (SYSTEM_MANAGER/DIRECTOR)
- **Acesso:** via API (sem UI dedicada)
- **Operações:** dashboard, partners CRUD (director), coworkings/clients (leitura), suspend/unsuspend
