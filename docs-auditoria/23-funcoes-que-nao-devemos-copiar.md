# Workeaser — Funções dos Concorrentes que Não Devemos Copiar (23)

> **Data:** 06/08/2026 — Critério: custo de desenvolvimento/manutenção, complexidade, baixa utilização, duplicação com sistemas externos, risco jurídico/segurança, dependência de terceiros, falta de relação com nosso modelo de negócio.

---

## 1. Não copiar agora (justificativa técnica)

| # | Função (concorrente) | Por que NÃO copiar | Custo | Risco |
|---|---|---|---|---|
| N1 | **IT Management completo (Wi-Fi gerenciado, billing de banda, roaming)** — Yardi Kube | EWS opera locais pequenos (10 unidades, 240 clientes); Wi-Fi gerenciado exige hardware Meraki/RADIUS e suporte contínuo; zero relação com o modelo VO | alto | alto (infra física) |
| N2 | **100+ gateways de pagamento** — Nexudus/Cobot | Overkill: Stripe (cartão+ACH) + GoCardless cobre 95% das necessidades; cada gateway = certificação PCI e manutenção | alto | médio |
| N3 | **E-invoices europeias (Peppol, ZATCA, KSeF)** — Spacebring | Mercado não é EU/ME; compliance regional sem retorno | médio | médio |
| N4 | **Hardware próprio de controle de acesso** — Proximity (Proximity Open) | Custo de hardware + firmware; integrar Kisi/Salto (padrão da indústria) é mais barato e portável | alto | alto |
| N5 | **Kiosk físico de recepção dedicado** — Nexudus (NexIO), Archie | Requer hardware + manutenção; tablet genérico com PWA resolve por fração do custo | médio | baixo |
| N6 | **Módulo de comunidade completo (feed, mural, networking, NPS)** — Spacebring | Alta complexidade social, baixa adesão em operação de VO (clientes são empresas, não comunidade aberta) | alto | médio |
| N7 | **Marketplace/e-commerce B2C** — Habu | EWS vende B2B (empresas); marketplace de day passes para público geral não é o core | médio | baixo |
| N8 | **Syndication de listings (Yardi Listing Network)** | Depende de rede de distribuição Yardi; para EWS, Google Business Profile + site próprio basta | médio | baixo |
| N9 | **White-label app para TERCEIROS (vender o sistema)** | Decisão estratégica de produto (ver 24); antes de SaaS, o sistema precisa de estabilidade | alto | alto |
| N10 | **Impersonation** | Risco de segurança e LGPD alto para benefício operacional baixo (admin pode ver logs) | médio | alto |

## 2. Copiar SOMENTE se o negócio crescer

| # | Função | Condição para copiar |
|---|---|---|
| C1 | Controle de acesso (Kisi/Salto) | Quando >3 unidades com portas controladas |
| C2 | Day pass público + e-commerce | Quando houver demanda walk-in em local movimentado |
| C3 | AI assistente | Depois de estabilidade + dados operacionais suficientes |
| C4 | Kiosk físico | Quando houver recepção 24/7 |

## 3. Regra de ouro

Não recomendar uma função apenas porque vários concorrentes têm. Cada função deve passar pelo teste: **"reduz trabalho manual, aumenta receita ou reduz erro financeiro NA OPERAÇÃO EWS?"** Se não — fica no backlog de opcionais.
