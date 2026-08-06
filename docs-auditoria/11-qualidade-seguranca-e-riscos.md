# Workeaser — Qualidade, Segurança e Riscos (11)

> **Data:** 06/08/2026 — Modo 100% leitura (revisão estática; NENHUM teste ofensivo executado)
> **Evidências:** [CODIGO] · [CONFIG] · [BANCO] · [RUNTIME] · [NAO_CONFIRMADO]
> **Escala:** 🔴 Crítica · 🟠 Alta · 🟡 Média · 🔵 Baixa

---

## 1. Problemas de segurança

| # | Criticidade | Problema | Impacto | Evidência | Recomendação | Esforço |
|---|---|---|---|---|---|---|
| S1 | 🔴 | Cookie `user-token` SEM httpOnly (linha comentada) | Roubo de sessão via XSS | [CODIGO — login/index.tsx: setCookie sem httpOnly] | Habilitar httpOnly (exige migrar para cookie httpOnly + auth via header) | Médio |
| S2 | 🔴 | `POST /api/auth/import` sem middleware | Criação em massa de users por qualquer pessoa | [CODIGO — routes/auth.ts] | Proteger com auth+admin ou remover | Pequeno |
| S3 | 🔴 | Credenciais placeholder (Google/Docusign/Plaid/Exchange) | Integrações inautenticáveis; sistema aberto | [CONFIG — env] | Configurar credenciais reais | Médio |
| S4 | 🟠 | CORS configurado para localhost (inclui 3005) | Sem restrição em produção (inexistente hoje) | [CONFIG — env] | Allowlist por ambiente | Pequeno |
| S5 | 🟠 | `POST /api/auth/admin` sem rate limit | Brute force no login admin | [CODIGO — rotas admin/auth] | Adicionar rateLimit | Pequeno |
| S6 | 🟠 | Emails compostos com vírgula (~20 clientes) | Contas inacessíveis + ambiguidade de identidade | [BANCO + RUNTIME] | Normalizar emails | Pequeno |
| S7 | 🟠 | Suspensão de user = soft delete (deleted_at) | "Suspenso" indistinguível de excluído | [CODIGO — admin-api ClientsService] | Campo status próprio | Médio |
| S8 | 🟠 | Senha padrão única para 238 clientes (T$irUP8ddMkPz7JK) | Comprometimento em cascata | [BANCO + memória] | Política de troca no 1º login | Médio |
| S9 | 🟡 | Rate limit em memória (perde no restart; possível bypass por IP rotativo) | Brute force parcialmente mitigado | [CODIGO — RateLimit] | Redis/banco | Grande |
| S10 | 🟡 | Webhook AdobeSign sem validação de assinatura | Eventos falsos | [CODIGO — webhooks/adobesign] | Validar | Pequeno |
| S11 | 🟡 | Uploads: fotos/vídeos/documentos — validação de tipo/tamanho não confirmada | Upload malicioso | [NAO_CONFIRMADO] | Validar MIME/tamanho | Pequeno |
| S12 | 🟡 | Criptografia em repouso / em trânsito | Sem SSL local | [NAO_CONFIRMADO] | SSL no deploy | — |
| S13 | 🔵 | CSRF: API bearer token (sem cookies de sessão para mutações) | Baixo risco | [CODIGO — guard OAT] | — | — |
| S14 | 🔵 | SQL injection: ORM Lucid + validators | Baixo risco (uso de query builder em alguns pontos — ex.: DashboardService admin usa query crua com parâmetros) | [CODIGO — admin-api DashboardService] | Revisar queries cruas | Pequeno |
| S15 | 🟡 | XSS: React escapa por padrão; áreas de renderização de HTML não identificadas | Baixo-médio | [NAO_CONFIRMADO] | Revisar dangerouslySetInnerHTML | Pequeno |
| S16 | 🟡 | Mass assignment: uso de Pick(payload, Model.fillable) no admin-api; workeaser-api não verificado | Atribuição indevida | [CODIGO — PartnerService] | Revisar fillables | Pequeno |
| S17 | 🟡 | Logs com dados sensíveis: logs de auditoria gravam ip/ua (ok), mas erros pino podem expor payloads | Vazamento em logs | [RUNTIME — docker logs mostram stack com paths] | Sanitizar | Pequeno |
| S18 | 🔵 | Open redirect: login com returnTo comentado | Baixo | [CODIGO — login/index.tsx returnTo comentado] | — | — |

## 2. Problemas de qualidade de código

| # | Criticidade | Problema | Evidência | Recomendação | Esforço |
|---|---|---|---|---|---|
| Q1 | 🟠 | 81 tabelas vazias + módulos completos sem uso | [BANCO] | Decidir cortar ou operar | Grande |
| Q2 | 🟠 | Duplicação de rotas de membership (client/membership vs membership) | [CODIGO — src/pages] | Remover legado | Pequeno |
| Q3 | 🟠 | Endpoint `/cowork/Taxs` (maiúscula) no frontend | [CODIGO — services/financial] | Corrigir path | Pequeno |
| Q4 | 🟡 | getTax → endpoint com maiúscula; resend sem barra inicial | [CODIGO] | Corrigir | Pequeno |
| Q5 | 🟡 | Middleware SilentAuth morto (admin-api); Model Location sem uso | [CODIGO] | Remover | Pequeno |
| Q6 | 🟡 | Código comentado em massa (Omnichat, Marketplace, NewLead, BookTour) | [CODIGO] | Limpar ou ativar via flag | Médio |
| Q7 | 🟡 | DealsOpportunities com "// to do" | [CODIGO] | Completar | Pequeno |
| Q8 | 🟡 | Tipagem: TS em todo o backend; frontend com any pontual (não quantificado) | [NAO_CONFIRMADO] | Auditar | Médio |
| Q9 | 🟠 | Sem testes no workeaser-api | [NAO_CONFIRMADO] | Criar | Grande |
| Q10 | 🟡 | Enums de auditoria admin com eventos nunca emitidos | [CODIGO] | Limpar | Pequeno |
| Q11 | 🟡 | Consultas dentro de loops / N+1 não auditadas | [NAO_CONFIRMADO] | Auditar com query profiler | Médio |
| Q12 | 🟡 | Chamadas externas sem timeout explícito (axios default) | [NAO_CONFIRMADO] | Configurar timeout | Médio |
| Q13 | 🟡 | Operações sem transação (DB transactions) não verificadas | [NAO_CONFIRMADO] | Auditar mutações multi-tabela | Médio |
| Q14 | 🟡 | Valores fixos no código (ex.: hash bcrypt hardcoded no import script) | [CODIGO — import-qbo-customers.py DEFAULT_PASS_HASH] | Parametrizar | Pequeno |
| Q15 | 🔵 | Nomenclatura inconsistente (fulltext/fulltext2, Taxs, sidebaOpen cookie typo) | [BANCO + CODIGO] | Padronizar | Médio |
| Q16 | 🟡 | FKs ausentes (apenas 7) | [BANCO] | Adicionar constraints | Grande |
| Q17 | 🟠 | Dependências vulneráveis/obsoletas não auditadas | [NAO_CONFIRMADO] | npm audit | Médio |

## 3. Integridade de dados

| # | Criticidade | Problema | Evidência |
|---|---|---|---|
| D1 | 🟠 | Meetroom price 5500 vs 350/800 (unidade inconsistente) | [BANCO] |
| D2 | 🟠 | Vínculo users↔client_accounts frouxo (sem FK) | [BANCO] |
| D3 | 🟠 | rooms 0 com room_prices 3 (órfãos) | [BANCO] |
| D4 | 🟡 | Virtual offices todos na location 4 | [BANCO] |
| D5 | 🟡 | Soft delete sem campo de "quem/porquê" (apenas deleted_at) | [BANCO + CODIGO] |
| D6 | 🟠 | emails compostos com vírgula | [BANCO] |

## 4. Riscos operacionais

| # | Criticidade | Risco | Evidência |
|---|---|---|---|
| R1 | 🔴 | Scheduler inativo — nenhuma automação roda | [RUNTIME] |
| R2 | 🔴 | Sem produção/backup offsite — PC local é SPOF | [CONFIG + NAO_CONFIRMADO] |
| R3 | 🔴 | BoldSign quebrada | [RUNTIME] |
| R4 | 🟠 | Stripe em teste — sem fluxo real validado | [CONFIG] |
| R5 | 🟡 | NODE_ENV=testing para seed (development quebra por pino-pretty ausente) | [CODIGO — seeders] |

## 5. Matriz resumo por severidade

| Severidade | Segurança | Qualidade | Dados | Operacional |
|---|---|---|---|---|
| Crítica | S1, S2, S3 | — | — | R1, R2, R3 |
| Alta | S4-S8 | Q1, Q2, Q3, Q9, Q17 | D1, D2, D6 | R4 |
| Média | S9-S12, S15-S16 | Q4-Q8, Q10-Q14, Q16 | D3, D4, D5 | R5 |
| Baixa | S13, S14, S18 | Q15 | — | — |
