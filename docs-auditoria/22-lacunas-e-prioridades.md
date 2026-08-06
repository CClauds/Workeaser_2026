# Workeaser — Lacunas e Prioridades (22)

> **Data:** 06/08/2026 — Funções ausentes/inferiores vs concorrentes, priorizadas para NOSSA operação (EWS Orlando: VO, correspondências, multi-unidade, cobrança recorrente, QBO, Stripe, reservas, contratos, inadimplência, acesso, CRM, WhatsApp, automações, auditoria, PT/EN/ES).

---

## Prioridades

- **P0:** risco crítico ou bloqueio operacional
- **P1:** impacto operacional/financeiro alto
- **P2:** melhoria relevante
- **P3:** melhoria opcional
- **NR:** não recomendado

---

## P0 — Crítico (bloqueia operação)

| # | Lacuna | Sistemas que têm | Importância | Benefício | Risco de não ter | Dependência | Complexidade | Esforço | Recomendação |
|---|---|---|---|---|---|---|---|---|---|
| L1 | **Ativar o scheduler** (faturas recorrentes, vencidos, filas) | todos | 5 | Cobrança automática | Contas não geradas/vencidas não cobradas | compose | baixa | pequeno | Subir `node ace scheduler:run` |
| L2 | **Fluxo operacional de correspondências** (registro, scan, forward, retirada, notificação) | Spacebring, Nexudus, OfficeRnD | 5 | Núcleo do negócio VO | Cliente VO sem gestão de mail | módulo mailbox existente | média | médio | Implementar fluxo completo + USPS 1583 |
| L3 | **Produção + backup offsite** | todos (SaaS) | 5 | Disponibilidade | Perda total (PC local) | infra | média | médio | VPS + backup + domínio/SSL |

## P1 — Alto impacto

| # | Lacuna | Sistemas que têm | Importância | Benefício | Risco | Dependência | Complexidade | Esforço | Recomendação |
|---|---|---|---|---|---|---|---|---|---|
| L4 | **App móvel (cliente)** | todos os 10 | 5 | Reservas/check-in no bolso do cliente | Cliente dependente do desktop | API pública | alta | grande | PWA primeiro, app depois |
| L5 | **Integração contínua QBO/Xero** | maioria | 5 | Contabilidade automática | Retrabalho contábil manual | credenciais | média | médio | Sync clientes/invoices/payments |
| L6 | **Contratos com e-sign funcional** | maioria | 4 | Assinatura sem papel | Assinatura quebrada (BoldSign) | fix BoldSign | baixa | pequeno | Consertar BoldSign ou Docusign real |
| L7 | **Inadimplência + suspensão automática** | maioria | 4 | Redução de calote | Receita não recebida | scheduler | média | médio | Fluxo dunning |
| L8 | **Check-in (QR/código)** | maioria | 4 | Controle de presença | Sem dados de utilização | app/QR | média | médio | QR no portal web |
| L9 | **CRM funcional com dados** | maioria | 4 | Pipeline de vendas | Leads perdidos | operação | baixa | pequeno | Usar módulo existente |
| L10 | **Controle de acesso (Kisi/Brivo/Salto)** | quase todos | 4 | Segurança física | Sem controle de porta | hardware | alta | grande | Integrar 1 provedor (Kisi) |

## P2 — Relevante

| # | Lacuna | Sistemas | Importância | Benefício | Complexidade | Esforço | Recomendação |
|---|---|---|---|---|---|---|---|
| L11 | API pública + docs | maioria | 5 | Integrações futuras/SaaS | média | médio | Documentar endpoints + tokens |
| L12 | ACH/direct debit | vários | 4 | Cobrança bancária (clientes BR/EUA) | média | médio | Stripe ACH (US) + PIX? (BR) |
| L13 | Multi-idioma (PT/EN/ES) | vários | 4 | Mercado | baixa | médio | i18n |
| L14 | Zapier/Make | vários | 3 | Automação no-code | baixa | médio | Webhooks públicos |
| L15 | Reserva de mesa (desks booking) | maioria | 3 | Hot desks | média | médio | Estender booking de meetrooms |
| L16 | Eventos | vários | 3 | Comunidade/receita | média | médio | Módulo events existe (vazio) |
| L17 | Campanhas/email marketing | vários | 3 | Retenção | média | médio | Template emails + segmentação |
| L18 | Relatórios com dados reais | todos | 4 | Decisão | baixa | pequeno | Operar módulos primeiro |
| L19 | USPS Form 1583 | Nexudus | 4 | Compliance VO EUA | média | médio | Formulário + validade |

## P3 — Opcional

| # | Lacuna | Sistemas | Importância | Complexidade | Esforço | Recomendação |
|---|---|---|---|---|---|---|
| L20 | IA (assistente/previsão) | líderes | 3 | alta | grande | Pós-estabilidade |
| L21 | Comunidade (feed, diretório) | Spacebring | 2 | média | médio | Opcional |
| L22 | Kiosk de recepção | vários | 2 | média | médio | Opcional |
| L23 | Impersonation | alguns | 2 | média | médio | Suporte admin |

## NR — Não recomendado (para nossa operação)

| # | Função | Motivo |
|---|---|---|
| L24 | IT Management (Wi-Fi gerenciado, billing de banda) — Yardi Kube | Fora do escopo EWS (locais pequenos) |
| L25 | Múltiplos gateways (100+) — Nexudus | Overkill; Stripe + 1-2 basta |
| L26 | E-invoices europeias (Peppol/ZATCA) | Mercado não é EU/ME |
| L27 | Hardware próprio de acesso — Proximity | Custo alto; integrar Kisi/Salto é suficiente |

---

## Ranking final das 10 mais importantes

1. L1 — Ativar scheduler (P0) — destrava cobrança e filas
2. L2 — Fluxo de correspondências + USPS 1583 (P0) — núcleo do negócio VO
3. L3 — Produção + backup (P0)
4. L4 — App móvel/PWA (P1)
5. L5 — Integração QBO contínua (P1)
6. L6 — Fix e-sign (P1)
7. L7 — Inadimplência automática (P1)
8. L8 — Check-in QR (P1)
9. L9 — CRM operacional (P1)
10. L11 — API pública (P2, habilita muitas outras)
