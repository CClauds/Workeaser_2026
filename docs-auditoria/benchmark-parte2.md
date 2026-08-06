# Benchmark Competitivo — Parte 2: Spacebring, Cobot, Coworks

> **Data:** 06/08/2026 — Pesquisa em fontes oficiais via subagentes
> **Classificação:** "Anunciado pelo fornecedor, mas não confirmado tecnicamente" · "Não foi possível confirmar"

---

## 1. Spacebring — ATIVO (ex-andcards)

- **Status:** Ativo, crescimento pleno. Era o "andcards" (incorporado 2017, backed por K-Startup, YC Startup School, Poland Prize, Startup Chile — confirmado em /about). Não adquirido.
- **URL:** https://spacebring.com | pricing: /pricing | API: /docs/api
- **Preços:** Business US$183/mês (mensal, mínimo 6 meses, 100 usuários ativos, 1 local); Enterprise sob consulta (500+ usuários, API/webhooks incluídos, 12 meses).

### Funcionalidades confirmadas (com fonte)
| Categoria | Funcionalidade | Fonte | Status |
|---|---|---|---|
| Pagamento | ACH/SEPA/BECS/Bacs + cartão + Apple/Google Pay via Stripe | /features/payments | Confirmado |
| Contabilidade | QuickBooks Online, Xero; e-invoices (Peppol, ZATCA, KSeF) | /integrations | Confirmado |
| CRM | Integrações Salesforce, HubSpot, Pipedrive (sem pipeline nativo) | /integrations | Confirmado (integrado, não nativo) |
| Acesso | Kisi, Salto KS, Brivo, Avigilon Alta, Tapkey, Luckey | /integrations | Confirmado |
| Automação | Zapier, Mailchimp | /integrations | Confirmado |
| Calendário | Google Calendar | /integrations | Confirmado |
| API | REST pública + webhooks + OpenAPI + MCP server ("Spacebring for Claude") | /docs/api | Confirmado |
| IA | "Lem AI" (age nos dados, multimodal), incluso em todos os planos | /pricing | Anunciado pelo fornecedor |
| eSignature | Dropbox Sign | /integrations | Confirmado |
| Apps | White-label app iOS/Android + portal web; admin app móvel | site oficial | Confirmado |
| Escritório virtual | Página /solutions/virtual-office-management-software: signup online de endereço virtual, mailroom com scan/forward/discard, gestão por tickets | site oficial | Confirmado |
| USPS 1583 | ❌ Não encontrado em docs | — | Não foi possível confirmar |
| Múltiplas unidades | Multi-local | site oficial | Confirmado |
| Comunidade | Diretório de membros | site oficial | Confirmado |

### Posicionamento
Forte em apps white-label, mailroom (scan/forward/discard) e IA (Lem); fraco em CRM nativo (depende de integrações).

---

## 2. Cobot — ATIVO (Berlim, pioneiro desde 2008)

- **Status:** Ativo, independente. "Powering coworking spaces since 2008"; 90+ países, 50k+ membros.
- **URL:** https://cobot.me | pricing: /pricing | API: dev.cobot.me/api-docs
- **Preços:** US$81/mês p/ 10 membros pagantes (slider por nº de membros); add-on External Bookings US$19/mês; Premium Support US$129/mês; plano único.

### Funcionalidades confirmadas (com fonte)
| Categoria | Funcionalidade | Fonte | Status |
|---|---|---|---|
| CRM | Lightweight CRM: visitors, drop-ins, leads, event attendees, tags, histórico de compra, conversão em 1 clique | homepage | Confirmado |
| Day pass | Day passes/drop-in | homepage | Confirmado |
| Reservas | Reservas de salas via Google Calendar | site oficial | Confirmado |
| Pagamento | Stripe, GoCardless, PayPal, Adyen, Authorize.net, Fidelity ACH | /integrations | Confirmado |
| Contabilidade | Xero, QuickBooks, DATEV/sevDesk/Fattura Elettronica (e-invoicing) | /integrations | Confirmado |
| Acesso | Kisi, Salto KS, Tapkey, Sensorberg, Luckey, Dormakaba, ezeep Blue | /integrations | Confirmado |
| Impressão | PaperCut | /integrations | Confirmado |
| Automação | Zapier, Mailchimp | /integrations | Confirmado |
| API | API v2 + v1 (legacy) REST + OAuth2 + webhooks | dev.cobot.me/api-docs | Confirmado |
| Apps | Members Mobile App nativo gratuito; white-label portal; bot builder próprio | site oficial | Confirmado |
| Escritório virtual | ❌ Mailroom/USPS 1583 não confirmado em docs públicas (guia "Legal Requirements for Virtual Offices" existe, sem feature de correio) | — | Não foi possível confirmar |

### Posicionamento
Pioneiro, simples, forte em API e integrações (100+ gratuitas); fraco/ausente em escritório virtual.

---

## 3. Coworks — ATIVO (EUA, 2018)

- **Status:** Ativo. Fundado 2018, HQ Raleigh NC (DeShawn Brown CEO, Phil Vanderwoude COO) — confirmado no arquivo oficial "For LLMs" (/for-llms-about-coworks).
- **URL:** https://coworks.com | pricing: /pricing
- **Preços:** Hybrid Workspace US$149/mês (150 membros); Coworking Premium US$249/mês (250 membros, billing automatizado, day passes, signup forms); Enterprise custom; add-ons white labeling e multicampus. Preços iguais anual/mensal.

### Funcionalidades confirmadas (com fonte)
| Categoria | Funcionalidade | Fonte | Status |
|---|---|---|---|
| CRM/vendas | Leads Database + Tour Requests (páginas dedicadas) | site oficial | Confirmado |
| Day pass | Day passes | site oficial | Confirmado |
| Reservas | Reserva de salas/equipamento + booking credits | site oficial | Confirmado |
| Eventos | Eventos | site oficial | Confirmado |
| Pagamento | Automated billing com Stripe (cartão, ACH, ACSS, BACS, iDEAL) | /billing-for-your-space | Confirmado |
| Contabilidade | QuickBooks, Xero | /billing-for-your-space | Confirmado |
| Acesso | Kisi, Brivo, Salto | /integrations-with-tools | Confirmado |
| Integrações | Zapier, HubSpot, Salesforce, Google/Outlook Calendar, ezeep, IronWifi | homepage + integrações | Confirmado |
| Relatórios | Looker embutido | site oficial | Confirmado |
| Múltiplas unidades | Multi-campuses | site oficial | Confirmado |
| Apps | App móvel white-label | site oficial | Confirmado |
| Check-in | Check-ins de membros e visitantes | site oficial | Confirmado |
| API pública | ❌ Não encontrada | — | Não foi possível confirmar |
| Webhooks | ❌ Não encontrados | — | Não foi possível confirmar |
| eSignature | ❌ Não encontrado | — | Não foi possível confirmar |
| Escritório virtual/USPS 1583 | ❌ Não encontrado | — | Não foi possível confirmar |

### Posicionamento
Simples e direto (EUA), forte em billing automatizado e check-ins; sem API pública confirmada — limitante para integração.

---

## Notas de evidência

- Fontes primárias: sites oficiais (pricing, features, integrations, docs API, "for LLMs").
- Itens ⚠️ marcados explicitamente como não confirmados.
- Nenhuma funcionalidade inventada; tudo tem URL de fonte.
