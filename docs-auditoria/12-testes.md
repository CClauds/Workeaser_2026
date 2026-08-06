# Workeaser — Testes (12)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] · [NAO_CONFIRMADO]
> **Regra:** não é declarada cobertura percentual (nenhuma ferramenta de cobertura foi executada nem relatório encontrado).

---

## 1. Inventário

| App | Diretório | Arquivos | Tipo | Evidência |
|---|---|---|---|---|
| admin-api | tests/functional/ | existem | Funcional (Japa) | [CODIGO — diretório + subagente leu] |
| workeaser-api | — | ❌ não encontrados | — | [NAO_CONFIRMADO] |
| workeaser-frontend | src/tests/ | existe | — | [CODIGO — existência; conteúdo não lido] |

## 2. Detalhe admin-api (tests/functional)

- Framework: AdonisJS testing (Japa) [CODIGO — dependência @japa/runner presumida pelo subagente]
- Cobertura funcional identificada: fluxos de auth/partners/clients (detalhe no analises/02-admin-api.md) [CODIGO]
- **Execução dos testes não confirmada** — não foi rodado teste (proibido nesta auditoria) [NAO_CONFIRMADO]

## 3. Matriz de cobertura

| Módulo | Unitário | Integração | API | E2E | Cobertura confirmada |
|---|---|---|---|---|---|
| workeaser-api (todo) | ❌ | ❌ | ❌ | ❌ | Nenhuma confirmada |
| admin-api (auth/partners/clients) | ❌ | ✅ tests/functional existem | ✅ (funcionais) | ❌ | Existência de arquivos; execução não confirmada |
| frontend | ❌ | ❌ | ❌ | ❌ | Nenhuma confirmada |
| Banco/migrations | ❌ | ❌ | ❌ | ❌ | Nenhuma |

## 4. Fluxos críticos SEM teste

1. Login + auth (todo o fluxo) — nenhum teste automatizado (validado manualmente em 06/08) [RUNTIME]
2. Pagamento Stripe (receive/capture/refund) — sem teste
3. Geração de fatura (GenerateInvoice) — sem teste
4. Webhooks (Stripe/SES/WhatsApp/eSign) — sem teste
5. Contratos + eSignature — sem teste
6. Reservas (meeting/day pass) — sem teste
7. LGPD (deletion/export) — sem teste
8. Migrations (289) — sem teste de rollback
9. Banco (relações, soft delete) — sem teste
10. Concorrência de reservas (conflito de horário) — sem teste

## 5. Mocks/fixtures/seeds

| Item | Situação |
|---|---|
| Seeder | DemoCoworkData (NODE_ENV=testing) — cria admin/demo/Acme + dados demo [CODIGO] |
| Fixtures de teste | não encontrados | 
| Mocks | não encontrados |
| Dados de teste em produção local | 240 clientes QBO + catálogo (dados reais importados) [BANCO] |

## 6. Pipeline de execução de testes

- ❌ Não identificado (sem CI/CD ativo) [NAO_CONFIRMADO]

## 7. Recomendações (para o backlog — ver 16)

1. Criar suíte de testes do workeaser-api (prioridade: auth, invoices, webhooks)
2. Testar migrations (up/down)
3. Testes de integração com Stripe (sandbox)
4. Rodar os testes existentes do admin-api e fixar falhas
5. Testes E2E do frontend (Playwright) para os fluxos críticos
