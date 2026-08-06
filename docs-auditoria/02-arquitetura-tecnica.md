# Workeaser — Arquitetura Técnica (02)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] · [CONFIG] · [BANCO] · [RUNTIME] · [NAO_CONFIRMADO]

---

## 1. Estilo arquitetural

- **Monólito modular por serviço:** 2 APIs AdonisJS separadas (workeaser-api e admin-api) + 1 frontend Next.js, compartilhando 1 MySQL [CODIGO — estrutura de src/]
- **Arquitetura em camadas dentro de cada API:** Controllers (HTTP) → Services (negócio) → Models (ORM Lucid) → Integrations (adapters) [CODIGO — app/Controllers, app/Services, app/Models, app/Integrations]
- **Padrão repository/impl nas integrações:** interfaces + Implementation (ex.: `Payments.interface.ts` + `StripeImplementation.ts`) [CODIGO]
- **SSR + SPA híbrido no frontend:** getServerSideProps para auth + SWR para dados pós-load [CODIGO — dashboard/index.tsx]

## 2. Divisão frontend/backend

| Camada | App | Porta | Responsabilidade |
|---|---|---|---|
| Frontend | workeaser-frontend | 3005 | UI, SSR, estado (AuthContext, SpacesContext), chamadas API |
| Backend principal | workeaser-api | 3333 | Todo o domínio: auth, cowork, client, admin, webhooks |
| Backend admin | admin-api | 3334 | Superfície administrativa interna: partners, inspeção, suspensão |
| Banco | workeaser-mysql | 3307 | MySQL 8.4 compartilhado |

## 3. Módulos principais

### workeaser-api
| Módulo | Controllers | Rotas (prefixo) |
|---|---|---|
| Auth/Me | AuthController, MeController, TwoFactor, AccountDeletion | /api/auth/*, /api/me/* |
| Cowork (operador) | 28 controllers | /api/cowork/* |
| Client (membro) | 10 controllers | /api/client/* |
| Admin (plataforma) | 4 controllers | /api/admin/* |
| Webhooks | 6 controllers | /api/webhooks/* |
| Utils/Infos | 5 controllers | /api/infos/* |
| Público | SpacesController, PublicInvoicesController | /api/spaces/*, /api/invoice/* |

### admin-api
| Módulo | Controllers | Rotas |
|---|---|---|
| Auth | AuthController | /api/auth/login, /logout, /me |
| Partners | PartnersController | /api/admin/partners* |
| Clientes/Coworkings | ClientsController | /api/admin/coworkings, /clients, /users/:id/suspend |
| Dashboard | DashboardController | /api/admin/dashboard |

## 4. Dependências internas

- workeaser-api e admin-api **compartilham o mesmo MySQL** — admin-api usa models "mirror read-only" de tabelas do workeaser-api (User, ClientAccount, CoworkAccount, Location) [CODIGO — comentários nos models do admin-api]
- O frontend consome **exclusivamente o workeaser-api** para as páginas admin do frontend (`/admin/*` chamam workeaser-api :3333) — o admin-api é ÓRFÃO no frontend [CODIGO — grep cruzado; ver 05-inconsistencias da doc anterior]

## 5. Dependências externas (bibliotecas)

| Biblioteca | Uso | Evidência |
|---|---|---|
| @adonisjs/lucid | ORM | package.json |
| @adonisjs/auth | OAT | package.json |
| @adonisjs/bouncer | RBAC | .adonisrc.json |
| adonis5-scheduler | Tasks | package.json |
| @adonisjs/drive-s3 | Uploads | .adonisrc.json |
| @adonisjs/mail | Email | .adonisrc.json |
| axios + SWR | HTTP frontend | package.json frontend |
| echarts | Gráficos | package.json + Chart components |
| Mapbox GL | Mapas | src/services/map |
| Stripe.js | Pagamento | _app.tsx Elements |

## 6. Autenticação, autorização, sessão

| Aspecto | Implementação | Evidência |
|---|---|---|
| Autenticação | Bearer token OAT (opaque access token) | [CODIGO — config/auth.ts, guard 'api', driver 'oat'] |
| Armazenamento token | Tabela api_tokens (workeaser) / partner_api_tokens (admin) | [BANCO] |
| Sessão frontend | Cookie `user-token` (nookies, sameSite strict, maxAge=expires_at, SEM httpOnly) | [CODIGO — login/index.tsx] |
| Expiração | Token expira em 1 dia (`expiresIn: '1days'`) | [CODIGO — admin AuthService]; workeaser usa expires_at |
| Refresh token | ❌ Não identificado | [NAO_CONFIRMADO] |
| Autorização (RBAC) | Middlewares nomeados: auth, coworkAuthorization:${Módulo}, clientAuthorization, adminAuthorization + Bouncer | [CODIGO — start/kernel.ts] |
| Módulos de permissão | cowork_user_modules (42 vínculos) → cowork_modules (6) | [BANCO] |
| 2FA | TOTP (status/setup/verify/disable) | [CODIGO — TwoFactorController] |
| Bloqueio de conta | Rate limit in-memory por IP+slot (35s) | [CODIGO — RateLimit middleware] |

## 7. Processamento síncrono vs assíncrono

| Tipo | Mecanismo | Evidência |
|---|---|---|
| Síncrono | Requisições HTTP diretas controller→service→db | [CODIGO] |
| Assíncrono (filas) | Tabelas email_queue, webhook_dead_letter_queue, whatsapp_messages | [BANCO — 0 registros] |
| Assíncrono (workers) | 8 tasks adonis5-scheduler | [CODIGO] — 🔴 NÃO RODAM [RUNTIME] |
| Eventos | Event.on('user:email_confirmed') → onboarding | [CODIGO — start/events/user.ts] |
| Webhooks | 6 endpoints públicos | [CODIGO — start/routes/webhooks] |

## 8. Armazenamento de arquivos

| Tipo | Implementação | Evidência |
|---|---|---|
| Fotos/Vídeos/Docs | Drive S3 (config) + controllers Photos/Videos/Documents; tabelas photos (28), videos (0), documents (0) | [CODIGO + BANCO] |
| Drive | `@adonisjs/drive-s3` (DRIVE_DISK) | [CONFIG + .adonisrc.json] |

## 9. Cache

- **Não há cache de aplicação generalizado** [NAO_CONFIRMADO]; exceção: métricas de subscriptions admin com "cache 60s" (menção do subagente) [CODIGO — Admin/SubscriptionsController]

## 10. Banco de dados

- MySQL 8.4, banco `workeaser_local`, 108 tabelas, 289 migrations aplicadas [BANCO]
- Apenas 7 FKs declaradas; relações majoritariamente lógicas via ORM [BANCO]
- Soft delete (deleted_at) em quase todos os models [CODIGO + BANCO]

## 11. Observabilidade, logs, tratamento de erros

| Aspecto | Implementação | Evidência |
|---|---|---|
| Logs de auditoria | LoggerMiddleware → tabela logs (150 registros) | [CODIGO + BANCO] |
| Audit admin | AdminAuditService → admin_audit_logs (0) | [CODIGO + BANCO] |
| Logs de aplicação | Logger do Adonis (pino) para stdout do container | [RUNTIME — docker logs] |
| Tratamento de erros | AppError (classe custom), ExceptionHandler, responseWithSuccess | [CODIGO — app/Exceptions, app/Utils] |
| Sentry/PostHog | Envs NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_POSTHOG_KEY definidos | [CONFIG — .env.docker] |

## 12. Build e deploy

| Etapa | Processo | Evidência |
|---|---|---|
| Build frontend | Dockerfile.frontend-pc: yarn install --frozen-lockfile + build com NEXT_IGNORE_BUILD_ERRORS (patch echarts SSR) | [CONFIG — Dockerfile.frontend-pc] |
| Build APIs | Dockerfiles workeaser-api/admin-api | [CONFIG] |
| Subir sistema | `docker compose -f compose.pc.yml --env-file .env.docker up -d` | [CONFIG + memória] |
| Deploy produção | ❌ Não existe | [NAO_CONFIRMADO] |
| Migrations em runtime | `node ace migration:run --force` (--force obrigatório) | [CODIGO/memória] |
| Health checks | /health, /health/db, /health/version (ambas APIs) | [CODIGO + RUNTIME] |

---

## 13. Diagramas

Os 5 diagramas Mermaid estão em `diagramas/`:
- system-architecture.mmd
- authentication-flow.mmd
- main-data-flow.mmd
- integrations-flow.mmd
- async-processes.mmd
- database-model.mmd

---

## 14. Decisões de arquitetura notáveis (Interpretação técnica)

1. **Duas APIs separadas** (workeaser-api + admin-api) com banco compartilhado: permite isolar a superfície administrativa, mas o admin-api não tem consumidor no frontend hoje — custo de manutenção sem benefício atual.
2. **Tabelas espelho read-only no admin-api**: padrão correto para não duplicar migrations, mas frágil se o schema do workeaser-api mudar.
3. **Scheduler como processo separado** (adonis5-scheduler exige `ace scheduler:run`): a arquitetura prevê workers, mas o runtime não os inicia — lacuna de operação, não de código.
4. **Soft delete onipresente**: bom para auditoria, mas a "suspensão" de usuário no admin-api usa o mesmo mecanismo que exclusão — semanticamente ambíguo.
5. **Relações sem FK**: o ORM resolve no app layer; risco de órfãos se houver escrita externa direta.
