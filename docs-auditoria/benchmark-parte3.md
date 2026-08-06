# Benchmark Competitivo — Parte 3: Proximity, Habu, Yardi Kube

> **Data:** 06/08/2026 — Pesquisa em fontes oficiais via subagentes
> **Classificação:** "Anunciado pelo fornecedor, mas não confirmado tecnicamente" · "Não foi possível confirmar"

---

## 1. Proximity — ATIVO

- **Status:** Ativo.
- **URL:** https://proximity.space | Coworking: /Coworking | Docs: docs.proximity.space
- **Preços (por localização, USD):** até 40 membros ativos US$209/mês; 41–85 US$259; 86–150 US$329; 151–250 US$449; 251–350 US$559; Enterprise US$679+. Payment processing 2.9%+30¢ cartão / 1% ACH (EUA). Door access US$99/mês/locação (Proximity Open ou Brivo/SALTO/Kisi).

### Funcionalidades confirmadas (com fonte)
| Categoria | Funcionalidade | Fonte | Status |
|---|---|---|---|
| Membros | Membership Management: sign-ups, tipos flexíveis, punch passes, gift cards, discounts, sign-up fees/depósitos | site + docs | Confirmado |
| Reservas | Reservations & Resources: salas, phone booths, recorrência, blackout dates, resource categories, Google Calendar sync | docs | Confirmado |
| Acesso | Controle de acesso digital: apps iOS/Android, geofencing, door schedules por membership, door logs; hardware "Proximity Open" + Brivo, SALTO KS, Kisi | site + docs | Confirmado |
| Wi-Fi | Wi-Fi access control (Cisco Meraki/RADIUS) | docs | Confirmado |
| Visitantes | Greeting/Visitor management: notificações de visitantes, pacotes e entregas de comida | site | Confirmado |
| Eventos | Events | site | Confirmado |
| Múltiplas unidades | Multispace Brand Dashboard: múltiplas unidades, memberships compartilhadas | site | Confirmado |
| Empresas | Team/Shared Memberships (empresas) | site | Confirmado |
| Pagamento | Stripe Connect + QuickBooks Online: faturas, ACH, disputas, refunds | site | Confirmado |
| Integrações | Zapier, HubSpot, ActiveCampaign, Mailchimp | site | Confirmado |
| Concierge | Proximity Wave (tablet p/ tours e check-in) | site | Confirmado |
| Apps | White-label app em ~2 semanas | site | Confirmado |
| Relatórios | Utilization, reservation density | docs | Confirmado |
| CRM/pipeline | ❌ Pipeline/propostas não confirmado (Wave faz tours) | — | Não foi possível confirmar |
| API pública | ❌ Não encontrada | — | Não foi possível confirmar |
| Webhooks | ❌ Não encontrados | — | Não foi possível confirmar |
| Escritório virtual/mailroom/USPS 1583 | ❌ Não encontrado | — | Não foi possível confirmar |

### Posicionamento
Forte em controle de acesso físico (hardware próprio + integrações), visitantes e multi-unidades; fraco em CRM e API pública.

---

## 2. Habu — ATIVO

- **Status:** Ativo. Empresa de Bristol/UK (Jak & Robert Ollett); usada em 30+ países.
- **URL:** https://habu.co | features: /features | pricing: /pricing
- **Preços:** US$60/mês até 40 usuários ativos (planos: 30 usuários US$48, 50 US$60, 80 US$92, 120 US$132) + US$1.50/usuário adicional; trial 14 dias sem cartão; anual com 20% desconto.

### Funcionalidades confirmadas (com fonte)
| Categoria | Funcionalidade | Fonte | Status |
|---|---|---|---|
| Portal membro | User Area: bookings, check-in, allowances, top-up, troca de workspace ("Switch Workspace" = múltiplas localizações), self signup | site | Confirmado |
| Check-in | Self check-in com rastreio de tempo e billing | site | Confirmado |
| Day pass | Day passes com bundle/expiry | site | Confirmado |
| Reservas | Booking de salas (member-led, out-of-hours) | site | Confirmado |
| Allowances | Allowances combináveis hotdesk+meeting room | site | Confirmado |
| Planos | Planos custom por membro | site | Confirmado |
| Faturamento | Automated billing; membros gerenciam pagamento/invoices/plan changes | site | Confirmado |
| E-commerce | Marketplace: day passes, produtos, eventos, ingressos; embed de planos no site (self-signup) | site | Confirmado |
| Integrações | Zapier, ezeep, Mailchimp, Slack, Kisi, OpenPath (fonte: review coworkingresources.org — NÃO oficial) | review externa | Não foi possível confirmar (fonte não oficial) |
| CRM/pipeline | ❌ Não encontrado | — | Não foi possível confirmar |
| Contratos e-sign | ❌ Não encontrado | — | Não foi possível confirmar |
| API pública/webhooks | ❌ Não encontrado | — | Não foi possível confirmar |
| Controle de acesso | ❌ Não confirmado | — | Não foi possível confirmar |
| Escritório virtual/mailroom | ❌ Não encontrado | — | Não foi possível confirmar |
| IA | ❌ Não encontrado | — | Não foi possível confirmar |

### Posicionamento
Forte em autoatendimento do membro (allowances, check-in, marketplace) e preço agressivo; escopo limitado (sem CRM/contratos/API confirmados).

---

## 3. Yardi Kube — ATIVO (produto Yardi)

- **Status:** Ativo (produto do grupo Yardi). Contexto corporativo: Yardi adquiriu Deskpass e Hubble (press release oficial: yardi.com/news/press-releases/yardi-acquires-coworking-and-flexible-workspace-platforms-deskpass-and-hubble).
- **URL:** https://www.yardikube.com | Space Mgmt: /yardi-kube-space-management/ | IT: /yardi-kube-it-management/ | Integrações/API: /integrations-api/ | Pricing: /flexible-pricing/
- **Preços:** Start US$349/mês (members ilimitados); Core e Pro custom. Clientela: WeWork, Office Evolution, Pacific Workplaces, Bond Collective, Premierworks (métricas vendor: 1.500+ locais, 500k+ bookings/mês, 1M+ membros).

### Funcionalidades confirmadas (com fonte)
| Categoria | Funcionalidade | Fonte | Status |
|---|---|---|---|
| App membro | Member App white-label: reservas de salas/mesas em tempo real, eventos, suporte, billing self-service, controle de acesso | site | Confirmado |
| Faturamento | Automated billing + reconciliação automática + Yardi Payment Processing | site | Confirmado |
| Contratos | E-sign embutido (Yardi e-sign/ySign), templates guiados, stepped deals/approvals, auto-renewals | site | Confirmado |
| Operação | Community Manager Dashboard: tours, bookings, visitors, tasks; MIMO tracking (move-in/out) | site | Confirmado |
| Vendas | Prospect Portal white-label com floorplans (prospects reservam/sign-up online) | site | Confirmado |
| Integrações | Zapier, HubSpot, Salesforce, Google Calendar, Kisi, Salto, Brivo + API & Webhooks | /integrations-api/ | Confirmado |
| IT | IT Management: Wi-Fi gerenciado, billing de banda, roaming entre sites | /yardi-kube-it-management/ | Confirmado |
| Marketing | Yardi Listing Network (syndication + captura de leads) | site | Anunciado pelo fornecedor |
| Leads | Lead generation tools | home | Anunciado pelo fornecedor |
| Escritório virtual/mailroom/USPS 1583 | ❌ Não encontrado | — | Não foi possível confirmar |
| CRM pipeline detalhado | ❌ Só integração HubSpot/Salesforce | — | Não foi possível confirmar |

### Posicionamento
Produto enterprise do grupo Yardi; forte em contratos com e-sign embutido, reconciliação automática, IT management e escala; foco em operadores grandes.

---

## Notas de evidência

- Fontes primárias: sites oficiais (product pages, pricing, docs, integrations).
- Itens ⚠️ marcados explicitamente como não confirmados.
- Nenhuma funcionalidade inventada; tudo tem URL de fonte.
