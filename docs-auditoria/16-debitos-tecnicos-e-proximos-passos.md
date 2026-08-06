# Workeaser — Débitos Técnicos e Próximos Passos (16)

> **Data:** 06/08/2026 — Backlog priorizado. Bugs e funcionalidades NÃO misturados.

---

## 1. Correções críticas (P0)

| # | Item | Evidência | Impacto | Recomendação | Esforço | Ordem |
|---|---|---|---|---|---|---|
| 1 | Scheduler não roda (8 tasks mortas) | [RUNTIME — /proc: só node server.js] | Nenhuma automação: faturas, emails, LGPD, retry webhooks | Adicionar serviço/processo `node ace scheduler:run` no compose | Pequeno | 1 |
| 2 | Sem produção/backup offsite | [CONFIG + NAO_CONFIRMADO] | Perda total do sistema | VPS + backup offsite (council 04/08: ação #1) | Médio | 2 |
| 3 | BoldSign quebrada (Invalid URL) | [RUNTIME — logs 23/07] | Assinatura eletrônica não funciona | Configurar base URL no BoldSign.impl.ts | Pequeno | 3 |
| 4 | Credenciais placeholder (Google/Docusign/Plaid/Exchange) | [CONFIG] | Integrações não autenticam | Configurar credenciais reais | Médio | 4 |
| 5 | POST /api/auth/import sem auth | [CODIGO] | Criação em massa exposta | Proteger/remover | Pequeno | 5 |

## 2. Segurança (P1)

| # | Item | Evidência | Impacto | Recomendação | Esforço |
|---|---|---|---|---|---|
| 1 | Cookie user-token sem httpOnly | [CODIGO] | Roubo de sessão via XSS | httpOnly + fluxo por header | Médio |
| 2 | POST /api/auth/admin sem rate limit | [CODIGO] | Brute force admin | rateLimit | Pequeno |
| 3 | Senha padrão única (238 clientes) | [BANCO] | Comprometimento em cascata | Troca no 1º login | Médio |
| 4 | Suspensão = soft delete | [CODIGO] | Ambiguidade suspenso/excluído | Campo status | Médio |
| 5 | Webhook AdobeSign sem validação | [CODIGO] | Eventos falsos | Assinatura HMAC | Pequeno |
| 6 | Rate limit em memória | [CODIGO] | Bypass por restart/IP | Redis | Grande |
| 7 | Validação de upload não confirmada | [NAO_CONFIRMADO] | Upload malicioso | Validar MIME/tamanho | Pequeno |

## 3. Integridade de dados (P1)

| # | Item | Evidência | Impacto | Recomendação | Esforço |
|---|---|---|---|---|---|
| 1 | Emails compostos (~20 clientes) | [BANCO + RUNTIME] | Login quebrado | Normalizar emails | Pequeno |
| 2 | Meetroom price inconsistente | [BANCO] | Cobrança errada | Unificar unidade (centavos) | Pequeno |
| 3 | Apenas 7 FKs | [BANCO] | Órfãos em escrita direta | FKs nas tabelas críticas | Grande |
| 4 | Vínculo users↔client_accounts frouxo | [BANCO] | Duplicidade/órfãos | FK + validação | Médio |
| 5 | rooms 0 + room_prices 3 | [BANCO] | Dados órfãos | Limpar/implementar | Pequeno |

## 4. Estabilidade (P1)

| # | Item | Evidência | Impacto | Recomendação | Esforço |
|---|---|---|---|---|---|
| 1 | PC local como único ambiente | [CONFIG] | SPOF (Windows Update derruba) | VPS + CI/CD | Grande |
| 2 | Migration chats.uuid falha silenciosa | [memória] | Migrations frágeis | Corrigir migration | Pequeno |
| 3 | NODE_ENV development quebra (pino-pretty) | [CODIGO] | Debug local difícil | Instalar dep ou usar testing | Pequeno |
| 4 | seed production pula DemoCoworkData | [CODIGO] | Sem dados em produção | Revisar seeds | Pequeno |

## 5. Testes (P2)

| # | Item | Evidência | Impacto | Recomendação | Esforço |
|---|---|---|---|---|---|
| 1 | Sem testes no workeaser-api | [NAO_CONFIRMADO] | Regressão | Suíte: auth, invoices, webhooks | Grande |
| 2 | Testes admin-api sem execução confirmada | [NAO_CONFIRMADO] | Falso positivo | Rodar e fixar | Médio |
| 3 | Sem teste de migrations | [NAO_CONFIRMADO] | Deploy quebrado | Teste up/down | Médio |
| 4 | Sem E2E frontend | [NAO_CONFIRMADO] | Fluxos críticos | Playwright (login→fatura) | Grande |
| 5 | Sem teste de integração Stripe | [NAO_CONFIRMADO] | Pagamento | Sandbox tests | Médio |

## 6. Manutenção (P2)

| # | Item | Evidência | Recomendação | Esforço |
|---|---|---|---|---|
| 1 | Rotas membership duplicadas | [CODIGO] | Remover legado | Pequeno |
| 2 | /cowork/Taxs maiúscula | [CODIGO] | Corrigir path | Pequeno |
| 3 | Código comentado em massa | [CODIGO] | Limpar/flag | Médio |
| 4 | SilentAuth/Location mortos | [CODIGO] | Remover | Pequeno |
| 5 | Enums de auditoria nunca emitidos | [CODIGO] | Limpar | Pequeno |
| 6 | admin-api órfão | [CODIGO] | Decidir: UI ou descontinuar | Médio |
| 7 | 81 tabelas vazias | [BANCO] | Decidir cortar ou operar | Grande |

## 7. Performance (P3)

| # | Item | Evidência | Recomendação | Esforço |
|---|---|---|---|---|
| 1 | N+1/consultas em loops não auditadas | [NAO_CONFIRMADO] | Profiler + preloads | Médio |
| 2 | Índices ausentes (só 7 FKs + alguns indexes) | [BANCO] | Índices em FKs/joins | Médio |
| 3 | Chamadas externas sem timeout | [NAO_CONFIRMADO] | Timeout axios | Médio |
| 4 | Rate limit em memória | [CODIGO] | Redis | Grande |

## 8. Melhorias funcionais (P3 — separado de bugs)

| # | Item | Evidência | Recomendação |
|---|---|---|---|
| 1 | Portal self-service do cliente | council 27/07 "1 missing" | Módulo booking/pay sem staff |
| 2 | Check-in automático/QR | council 27/07 | Pós-estabilidade |
| 3 | Integração contábil contínua QBO | memória (import foi pontual) | Sincronização recorrente |
| 4 | Relatórios com dados reais | [BANCO] | Operar módulos primeiro |
| 5 | Multi-idioma (PT/EN/ES) | requisito benchmark | i18n |

## 9. Ordem sugerida de execução (30 dias)

1. **Semana 1:** subir scheduler (P0-1) + BoldSign (P0-3) + proteger /auth/import (P0-5) + rate limit admin (P1-2)
2. **Semana 1-2:** normalizar emails compostos (P1-3.1) + fix meetroom price (P1-3.2)
3. **Semana 2-3:** cookie httpOnly (P1-2.1) + política de troca de senha clientes (P1-2.3)
4. **Semana 3-4:** VPS + backup offsite + domínio/SSL (P0-2, P1-4.1)
5. **Semana 4:** rodar testes admin-api e corrigir (P2-5.2)
