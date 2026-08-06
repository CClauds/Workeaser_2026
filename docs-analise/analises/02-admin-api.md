# Análise Técnica — Admin API (AdonisJS 5)

> **Sistema:** Workeaser (gestão de coworking)
> **Componente:** `admin-api` (superfície administrativa interna)
> **Código-fonte:** `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\src\admin-api\admin-management-api-main\`
> **Stack:** AdonisJS 5 (Core ^5.9.0) + Lucid ORM ^18.3.0 + Auth (OAT) ^8.2.3 + MySQL (mysql2 ^3.11.5) + TypeScript ^5.6.3
> **Porta:** 3334 (Dockerfile.admin-api, EXPOSE 3334)
> **Modo da análise:** 100% read-only. Nada foi alterado ou executado.
> **Data:** 2026-08-06

---

## 0. Visão geral [CODIGO]

O admin-api é um serviço AdonisJS **separado** do workeaser-api (porta 3333). Ele expõe a "superfície administrativa" de gestão de parceiros internos (partners), inspeção read-only de clientes/coworkings e suspensão/reativação de usuários, além de métricas de dashboard e health checks.

- Comentário do cabeçalho de rotas (`start/routes.ts`): *"Workeaser Admin API — internal management surface (partners, clients, dashboard). Public surface limited to `/api/auth/login`; everything else requires an authenticated partner."*
- Autenticação: guard `api` (OAT — Opaque Access Token) com tabela `partner_api_tokens`, provider Lucid sobre o model `Partner` (`config/auth.ts`).
- Conexão MySQL única: `DB_CONNECTION=mysql` (`config/database.ts`).
- **Importante:** os models `User`, `ClientAccount`, `CoworkAccount` e `Location` são explicitamente **mirrors read-only** de tabelas gerenciadas pelo **workeaser-api** (comentários nos próprios models). O admin-api **não possui migrations** dessas tabelas — apenas `partners`, `partner_api_tokens` e `admin_audit_logs`.

---

## 1. Lista completa de rotas [CODIGO]

Fonte: `start/routes.ts` + `start/routes/{auth,partners,clients,dashboard}.ts` (lidos inteiros).

### 1.1 Rotas públicas / health (`start/routes.ts`)

| Método | Path | Controller@Action | Middleware |
|---|---|---|---|
| GET | `/` | closure inline | — (nenhum) |
| GET | `/healthz` | closure inline | — |
| GET | `/health` | closure inline | — |
| GET | `/health/db` | closure inline | — |
| GET | `/health/version` | closure inline | — |

- `GET /` → `{ service: 'workeaser-admin-api', status: 'ok' }`.
- `GET /healthz` → `{ ok: true, ts }` (compatibilidade com probes simples).
- `GET /health` → `{ ok, service, env, ts }` usando `BuildInfo`.
- `GET /health/db` → executa `SELECT 1 as ok`; 200 com `latency_ms` ou 503 se falhar.
- `GET /health/version` → expõe `service`, `version`, `env`, `bootedAt`, `commit` (COMMIT_SHA/GIT_COMMIT, 12 chars), `node` via `App/Utils/BuildInfo`.

### 1.2 Auth (`start/routes/auth.ts`)

| Método | Path | Controller@Action | Middleware |
|---|---|---|---|
| POST | `/api/auth/login` | `AuthController.login` | `rateLimit:auth_admin_login` |
| POST | `/api/auth/logout` | `AuthController.logout` | `auth` |
| GET | `/api/auth/me` | `AuthController.me` | `auth` |

### 1.3 Partners (`start/routes/partners.ts`)

| Método | Path | Controller@Action | Middleware |
|---|---|---|---|
| GET | `/api/admin/partners` | `PartnersController.index` | `auth` |
| GET | `/api/admin/partners/:id` | `PartnersController.show` | `auth` |
| POST | `/api/admin/partners` | `PartnersController.store` | `auth`, `adminRole:SYSTEM_DIRECTOR` |
| PUT | `/api/admin/partners/:id` | `PartnersController.update` | `auth`, `adminRole:SYSTEM_DIRECTOR` |
| DELETE | `/api/admin/partners/:id` | `PartnersController.destroy` | `auth`, `adminRole:SYSTEM_DIRECTOR` |

### 1.4 Clientes / coworkings / usuários (`start/routes/clients.ts`)

| Método | Path | Controller@Action | Middleware |
|---|---|---|---|
| GET | `/api/admin/coworkings` | `ClientsController.listCoworkings` | `auth` |
| GET | `/api/admin/coworkings/:id` | `ClientsController.showCoworking` | `auth` |
| GET | `/api/admin/clients` | `ClientsController.listClients` | `auth` |
| GET | `/api/admin/clients/:id` | `ClientsController.showClient` | `auth` |
| POST | `/api/admin/users/:userId/suspend` | `ClientsController.suspendUser` | `auth`, `adminRole:SYSTEM_DIRECTOR` |
| POST | `/api/admin/users/:userId/unsuspend` | `ClientsController.unsuspendUser` | `auth`, `adminRole:SYSTEM_DIRECTOR` |

### 1.5 Dashboard (`start/routes/dashboard.ts`)

| Método | Path | Controller@Action | Middleware |
|---|---|---|---|
| GET | `/api/admin/dashboard` | `DashboardController.metrics` | `auth` |

### 1.6 Registro de middlewares nomeados (`start/kernel.ts`)

Globais: `BodyParser`, `SecurityHeaders`.
Nomeados: `auth` → `App/Middleware/Auth`; `adminRole` → `App/Middleware/AdminRole`; `rateLimit` → `App/Middleware/RateLimit`.

> ⚠️ **`App/Middleware/SilentAuth.ts` existe mas NÃO está registrado** no kernel nem é referenciado por nenhuma rota — middleware morto (scaffold padrão do Adonis). [CODIGO]

---

## 2. Controllers — ações, comportamento real e models usados [CODIGO]

### 2.1 `AuthController` (`app/Controllers/Http/AuthController.ts`)

| Ação | O que faz |
|---|---|
| `login` | Valida presença de `email`/`password` (AppError 400 se faltar). Delega a `AuthService.login` (usa guard `api`, token com `expiresIn: '1days'`). Loga `Logger.info`, grava audit `admin.login` (success/failure via fire-and-forget `void AdminAuditService.log`). Retorna `responseWithSuccess` com `{ type, token, expires_at, user }`. Seta `Cache-Control: no-cache, no-store`. |
| `logout` | `auth.use('api').revoke()` (revoga token atual). Grava audit `admin.logout`. Retorna `{ revoked: true }`. |
| `me` | Retorna `auth.user.toJSON()` (partner autenticado). AppError 401 se não autenticado. |

Models usados: indireto — `Partner` via guard de autenticação; `AdminAuditLog` via `AdminAuditService`.

### 2.2 `PartnersController` (`app/Controllers/Http/PartnersController.ts`)

| Ação | O que faz |
|---|---|
| `index` | Lê `page` (default 1), `per_page` (default 20) e `search` do query string; delega a `PartnerService.list`. Retorna paginado. |
| `show` | `PartnerService.show(params.id)`; retorna `partner.toJSON()`. |
| `store` | Valida com `CreatePartnerValidator`; `PartnerService.create`; grava audit `partner.create`; retorna **201** com corpo `{ status:'OK', result, error:null }`. |
| `update` | Valida com `UpdatePartnerValidator`; `PartnerService.update`; se o partner autenticado **rebaixou a si mesmo** (id igual e role ≠ SYSTEM_DIRECTOR), chama `PartnerService.ensureDirectorExists()` (garante que resta ≥1 diretor, senão AppError 409). Audit `partner.update`. |
| `destroy` | Impede deletar a si mesmo (`PartnerService.softDelete` lança 400). Soft delete (seta `deleted_at`). Depois `ensureDirectorExists()`. Audit `partner.delete`. Retorna `{ deleted: true }`. |

Models usados: `Partner` (via `PartnerService`), `AdminAuditLog` (via audit).

### 2.3 `ClientsController` (`app/Controllers/Http/ClientsController.ts`)

| Ação | O que faz |
|---|---|
| `listCoworkings` | Valida `ListClientsValidator`; `ClientsService.listCoworkings({page, perPage, search, sort, order})` sobre `CoworkAccount` (filtra `deleted_at IS NULL`, busca por `name`/`email`, ordena por `name`/`email`/`created_at`). Paginado. |
| `listClients` | Mesmo padrão sobre `ClientAccount` com preload de `user`; busca por `company_name`/`company_email`; ordena por `company_name`/`company_email`/`created_at`. Paginado. |
| `showCoworking` | `ClientsService.showCoworking(id)`; 404 se não achar. |
| `showClient` | `ClientsService.showClient(id)` com preload `user`; 404 se não achar. |
| `suspendUser` | `ClientsService.suspendUser(userId)`: acha `User`; 404 se não existir; 409 se já suspenso; faz `UPDATE users SET deleted_at=NOW()`. Audit `user.suspend` (success/failure). Retorna `{ id, status:'SUSPENDED' }`. |
| `unsuspendUser` | `ClientsService.unsuspendUser(userId)`: 409 se já ativo; `UPDATE users SET deleted_at=NULL`. Audit `user.reactivate`. Retorna `{ id, status:'ACTIVE' }`. |

Models usados: `CoworkAccount`, `ClientAccount` (+`User` via belongsTo preload), `User`, `AdminAuditLog`.

> ⚠️ Suspensão é **soft delete** em `users.deleted_at` — a "suspensão" é indistinguível de exclusão lógica na tabela compartilhada com o workeaser-api. [CODIGO]

### 2.4 `DashboardController` (`app/Controllers/Http/DashboardController.ts`)

| Ação | O que faz |
|---|---|
| `metrics` | `DashboardService.metrics()`; retorna métricas agregadas. |

Models usados: nenhum model; usa `Database` (query builder cru) sobre `cowork_accounts`, `users`, `client_accounts`, `locations`, `partners`.

### 2.5 Services (camada de negócio)

| Service | Métodos | Notas |
|---|---|---|
| `AuthService` (`app/Services/AuthService.ts`) | `login({email,password})` | `auth.use('api').attempt(email, password, { expiresIn:'1days' })`; converte erro em AppError 401 `'Email or password is incorrect'`. |
| `PartnerService` (`app/Services/PartnerService.ts`) | `list`, `show`, `create`, `update`, `softDelete`, `ensureDirectorExists` | Converte payload snake_case→camelCase com `toCamel`; usa `Pick(payload, Partner.fillable)`; `update` remove `password` vazio para não apagar senha acidentalmente; `softDelete` bloqueia autodeleção; `ensureDirectorExists` exige ≥1 SYSTEM_DIRECTOR ativo (409). |
| `ClientsService` (`app/Services/ClientsService.ts`) | `listCoworkings`, `listClients`, `showCoworking`, `showClient`, `suspendUser`, `unsuspendUser` | Detalhado em 2.3. |
| `DashboardService` (`app/Services/DashboardService.ts`) | `metrics` | 8 métricas com fallback seguro por métrica (`safe()`: loga warning e usa fallback se a query falhar). Queries cruas: `countActiveTable`/`countTable`/`recentSignups` (30d)/`coworkGrowth` (12 meses, `DATE_FORMAT` MySQL). |
| `AdminAuditService` (`app/Services/AdminAuditService.ts`) | `log(opts)` | Fire-and-forget; erro de audit NUNCA propaga; extrai IP (X-Forwarded-For) e User-Agent; nunca grava senha/token/body; enum de eventos inclui `client.create/update/delete` e `cowork.create/update/delete` **que nunca são emitidos** (não há CRUD de clients/coworks neste API). |

---

## 3. Models e tabelas [CODIGO]

| Model | Arquivo | Tabela | Natureza |
|---|---|---|---|
| `Partner` | `app/Models/Partner.ts` | `partners` | Gerida pelo admin-api. PK string (UUID v4 via hook `beforeCreate`); `role` default `SYSTEM_MANAGER`; hash bcrypt de senha em `beforeSave`; soft delete `deleted_at`; getters `fullName`, `isDirector`. |
| `User` | `app/Models/User.ts` | `users` | **Mirror read-only** do workeaser-api. `serializeAs: null` em `password` e `deletedAt`. Relações `hasOne` `coworkAccount` (FK `user_id`) e `clientAccount`. |
| `ClientAccount` | `app/Models/ClientAccount.ts` | `client_accounts` | **Mirror read-only**. `belongsTo User` (FK `user_id`). |
| `CoworkAccount` | `app/Models/CoworkAccount.ts` | `cowork_accounts` | **Mirror read-only**. Comentário no código: *"cowork_accounts does NOT have a direct `user_id` column. The owner link goes through the join table `cowork_users`"* — relação propositalmente não preloadada. |
| `Location` | `app/Models/Location.ts` | `locations` | **Mirror read-only**. Só `id`, `cowork_account_id`, `name`, timestamps. **Model sem nenhum uso no código** (nenhum controller/service o importa — `DashboardService` usa query crua). |
| `AdminAuditLog` | `app/Models/AdminAuditLog.ts` | `admin_audit_logs` | Gerida pelo admin-api. `metadata` JSON com prepare/consume; `outcome` success/failure. |

> ⚠️ `Location` é código efetivamente morto como model (sem referências), mas a tabela é consultada via query builder no dashboard. [CODIGO]

---

## 4. Migrations [CODIGO]

Total: **4 arquivos** em `database/migrations/`.

| Migration | Cria/Altera | Resumo |
|---|---|---|
| `1673233242266_partners.ts` | cria `partners` | `id` string PK; `first_name`, `last_name`, `email` (unique+index), `password` (255), `profile_image_url` (500, nullable); `created_at`, `updated_at`, `deleted_at` (nullable). |
| `1673242525580_partner_api_tokens.ts` | cria `partner_api_tokens` | `id` autoincrement PK; `partner_id` FK → `partners.id` ON DELETE CASCADE; `name`, `type`, `token` (64, unique); `expires_at`, `created_at`. Tabela do guard OAT. |
| `1715000000000_add_role_and_indexes_to_partners.ts` | altera `partners` | Adiciona coluna enum `role` (`SYSTEM_DIRECTOR`/`SYSTEM_MANAGER`) NOT NULL default `SYSTEM_MANAGER` após `password`; índice `idx_partners_deleted_at` em `deleted_at`. Reversível. |
| `1747000000000_create_admin_audit_logs.ts` | cria `admin_audit_logs` | `id` bigIncrements PK; `event` (80), `actor_partner_id` bigint unsigned nullable, `actor_email` (191), `target_type` (60), `target_id` bigint unsigned, `ip` (64), `user_agent` (255), `outcome` (20) default `success`, `metadata` JSON nullable, `created_at`; 4 índices (event, actor, target, created_at). |

> Não há migrations das tabelas `users`, `client_accounts`, `cowork_accounts`, `locations`, `cowork_users` — são de responsabilidade do workeaser-api. O admin-api depende do schema compartilhado no mesmo banco MySQL. [CODIGO]

---

## 5. Middlewares e Validators [CODIGO]

### 5.1 Middlewares

| Middleware | Arquivo | Papel |
|---|---|---|
| `Auth` | `app/Middleware/Auth.ts` | Scaffold padrão Adonis: autentica contra guards (default `api`), lança `AuthenticationException` se falhar. |
| `AdminRole` | `app/Middleware/AdminRole.ts` | Recebe roles via `adminRole:ROLE`. Sem argumento: só exige partner autenticado. Compara `partner.role` (uppercase) com roles exigidas; nega com AppError 403 se não bater. |
| `RateLimit` | `app/Middleware/RateLimit.ts` | **In-memory** (Map) por `slot:IP` (usa X-Forwarded-For). Slot `auth_admin_login` default `10/60` (10 req/60s), configurável via env `RATE_LIMIT_AUTH_ADMIN_LOGIN`. Headers `X-RateLimit-*` e `Retry-After`; 429 com corpo `{status:'ERROR', error:{code:'RATE_LIMIT',...}}`. Limpeza de buckets expirados a cada 1000 entradas. ⚠️ **In-memory = não compartilhado entre instâncias e zera no restart** (limitação arquitetural). |
| `SecurityHeaders` | `app/Middleware/SecurityHeaders.ts` | Global: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `X-Permitted-Cross-Domain-Policies`; HSTS em produção; `Cache-Control: no-store...` + `Pragma` + `Expires` em TODAS as respostas. |
| `SilentAuth` | `app/Middleware/SilentAuth.ts` | Scaffold Adonis. **NÃO registrado no kernel nem usado** — código morto. |

### 5.2 Validators (Adonis Vine/schema — `app/Validators/`)

| Validator | Regras |
|---|---|
| `CreatePartnerValidator` | `first_name`/`last_name` (2–120, trim); `email` (valid + unique em `partners` onde `deleted_at IS NULL`); `password` (8–256); `role` opcional enum [SYSTEM_DIRECTOR, SYSTEM_MANAGER]; `profile_image_url` opcional URL. Mensagens customizadas. |
| `UpdatePartnerValidator` | Todos opcionais; unique de email excluindo o próprio `:id` via `schema.refs`. |
| `ListClientsValidator` | `page` (unsigned), `per_page` (unsigned 1–100), `search` (≤120), `type` enum [COWORKING, CLIENT] (**declarado mas não usado** pelo controller — o tipo é ignorado em `listCoworkings`/`listClients`), `sort` enum [name, createdAt, email], `order` enum [asc, desc]. |

> ⚠️ `ListClientsValidator.type` nunca é lido pelos controllers — campo morto. [CODIGO]

---

## 6. Testes (`tests/functional/`) [CODIGO]

Suite `functional` configurada em `.adonisrc.json` (glob `tests/functional/**/*.spec(.ts|.js)`, timeout 60s), Japa + `@japa/preset-adonis`. Bootstrap (`tests/bootstrap.ts`): plugins `assert`, `runFailedTests`, `apiClient`; reporter `specReporter`; hooks de seed/truncate **comentados**; `configureSuite` sobe o HTTP server para a suite functional.

| Arquivo | Cobre | Status provável |
|---|---|---|
| `tests/functional/auth/login.spec.ts` | 2 testes: (1) login com sucesso usando **mock sinon** de `AuthService.prototype.login` (mocka o service, não testa integração real com banco); (2) falha com credenciais inválidas — mock `throws()` sem argumento. | ⚠️ **Testes frágeis/desatualizados**: (1) dependem de mock de service, não validam o fluxo real; (2) o `throws()` sem erro tipado cairia em `responseWithError` como `INTERNAL_ERROR` → status **500**, mas o teste espera **401**; também espera `body.message` no topo, mas `responseWithError` devolve `{status, error:{...}}` sem `message` no topo. |
| `tests/functional/healthcheck.spec.ts` | 1 teste: `GET /` esperando status 200 e `assertBodyContains({ hello: 'world' })`. | ⚠️ **Stub legado quebrado**: a rota real retorna `{ service: 'workeaser-admin-api', status: 'ok' }` — sem `hello: 'world'`. O teste falharia. |

> Não há testes para partners, clients, dashboard, middleware AdminRole, rate limit nem audit logs. Cobertura efetiva ≈ zero para a lógica de negócio (só mock unitário de login + stub quebrado). [CODIGO]

---

## 7. Configurações e infraestrutura relevantes [CODIGO]

- `config/auth.ts`: guard `api` OAT, tabela `partner_api_tokens`, FK `partner_id`, provider Lucid model `Partner`, uid `email`.
- `config/database.ts`: conexão `mysql` (mysql2), migrations com `naturalSort`, healthCheck off.
- `config/app.ts`: `trustProxy` = loopback; `etag: false`; `forceContentNegotiationTo: 'application/json'`; logger com redação de `password`; `generateRequestId: false`.
- `config/cors.ts`: **CORS desabilitado** (`enabled: false`). Isso indica consumo server-to-server (ou via proxy) — se um browser consumisse o admin-api diretamente, CORS falharia.
- `config/hash.ts`: default bcrypt (10 rounds); argon2 e scrypt disponíveis.
- `config/bodyparser.ts`: JSON/form/raw 1mb; multipart 20mb; methods POST/PUT/PATCH/DELETE.
- `config/drive.ts`: disk local `local`, root `tmp/uploads`, serve em `/uploads` (não usado por nenhuma rota).
- `env.ts` (validação de env): `HOST`, `PORT`, `APP_KEY`, `APP_NAME`, `DRIVE_DISK=local`, `NODE_ENV`, `DB_CONNECTION`, `MYSQL_HOST/PORT/USER/PASSWORD/DB_NAME`. ⚠️ `RATE_LIMIT_AUTH_ADMIN_LOGIN` é lido em runtime mas **não está no schema de env**.
- `contracts/`: `auth.ts` (GuardsList api + ProvidersList user), `enums.ts` (`PartnerRoleEnum`, `UserRoleEnum`, `AccountStatusEnum`), além de scaffolds `drive/events/hash/tests/env`.
- `Dockerfile.admin-api`: multi-stage Node 22, copia build e ace-manifest, roda como usuário não-root, EXPOSE 3334, HEALTHCHECK via `wget /health/db`.
- `docker-compose.yml` (raiz do workeaser): sobe `admin-api` na porta 3334; o `frontend` recebe `NEXT_PUBLIC_API_URL=http://172.16.4.23:3333/api` e `NEXT_PUBLIC_ADMIN_API_URL=http://172.16.4.23:3334/api`.
- CI/CD: `.github/workflows/ci.yml` e `cd.yml` — **Node 14** (desatualizado vs `engines.node >=20` do package.json); CD faz deploy via SSH em EC2 com pm2 (`admin-management-api`) e `node ace migration:run`.
- `database/seeders/Partner.ts`: cria partner `testing@mail.com` / `12345678` role SYSTEM_DIRECTOR (idempotente).
- `database/factories/index.ts`: vazio (só comentário). `commands/`: só `index.ts` de scaffold (nenhum comando customizado). `providers/AppProvider.ts`: scaffold vazio.
- Artefatos no repo: `nm.zip`, `node_modules.zip`, `node_modules_temp/` (empacotados para deploy offline).
- `.env.test` não pôde ser lido (proteção de segredo do ambiente de análise) — estrutura provavelmente espelha `.env.example` (PORT 3333, HOST 0.0.0.0, APP_KEY vazio, DB mysql/lucid). [NAO_CONFIRMADO para o conteúdo do .env.test]

---

## 8. Sinais de incompletude, stubs e código morto [CODIGO]

1. **Frontend NÃO consome o admin-api.** [CODIGO — evidência cruzada]
   - `docker-compose.yml` define `NEXT_PUBLIC_ADMIN_API_URL` (porta 3334), mas **nenhum** arquivo do frontend (`src/`) referencia `NEXT_PUBLIC_ADMIN_API_URL` ou a porta 3334 (grep em todo `src` do frontend não achou ocorrências).
   - O frontend usa `getAPIClient()` → `NEXT_PUBLIC_API_URL` (porta 3333 = **workeaser-api**) para tudo, inclusive o login (`POST /auth/login` em `src/services/api/auth/index.ts`) e as telas de admin (`src/pages/admin/{audit-logs,discounts,metrics,webhook-dlq}/` chamam `/admin/audit-logs`, `/admin/discounts`, `/admin/subscriptions/metrics`, `/admin/webhook-dlq`...).
   - Esses endpoints admin do frontend **existem no workeaser-api** (`start/routes/admin/{auditlogs,discounts,subscriptions,webhookdlq,auth}.ts` com prefixo `api/admin/...`), **não** no admin-api.
   - **Conclusão:** o admin-api (partners/clients/dashboard/suspend) é hoje uma superfície **órfã** — ou é consumida por outro cliente (ainda não localizado) ou está aguardando integração. As telas admin do frontend dependem do workeaser-api, não dele.
2. **Rotas do admin-api não são chamadas por nenhuma página do frontend analisado**: não há referência a `/api/admin/partners`, `/api/admin/clients`, `/api/admin/coworkings`, `/api/admin/dashboard`, `/api/admin/users/:id/suspend` em `src/` do frontend. [CODIGO]
3. **Teste stub quebrado**: `tests/functional/healthcheck.spec.ts` espera `{hello:'world'}` que a rota `/` não retorna. [CODIGO]
4. **Teste de login desatualizado**: mock sinon sem integração; cenário de falha espera 401/mensagem em formato que o `responseWithError` não produz. [CODIGO]
5. **`SilentAuth` morto** (não registrado). [CODIGO]
6. **`Location` model morto** (sem usos; só query crua no dashboard). [CODIGO]
7. **`ListClientsValidator.type` (COWORKING/CLIENT) não utilizado** pelos controllers. [CODIGO]
8. **Eventos de audit nunca emitidos**: enum `AuditEvent` inclui `client.create/update/delete` e `cowork.create/update/delete`, mas não há CRUD de clientes/coworkings neste API. [CODIGO]
9. **RateLimit in-memory** — não escala horizontalmente; perde contadores a cada restart/deploy. [CODIGO]
10. **CI/CD com Node 14** enquanto `package.json` exige Node ≥20. [CODIGO]
11. **`RATE_LIMIT_AUTH_ADMIN_LOGIN` fora do schema de env** (`env.ts` não valida variáveis não listadas — na prática apenas documenta). [CODIGO]
12. **Frontend login aponta para o workeaser-api**: `signInRequest` → `POST /auth/login` em `NEXT_PUBLIC_API_URL`; ou seja, nem o login de admin passa pelo admin-api hoje. [CODIGO]
13. **Scaffolds vazios**: `database/factories/index.ts`, `commands/`, `providers/AppProvider.ts`, `contracts/{events,hash,drive,tests,env}.ts` (só assinaturas padrão). [CODIGO]
14. **Sem migrations de `users`/`client_accounts`/`cowork_accounts`/`locations`** — dependência implícita do schema do workeaser-api no mesmo banco (risco de acoplamento de deploy: as migrations do admin-api rodam `migration:run` no mesmo schema). [CODIGO]
15. **Não foram encontrados TODOs/FIXME/HACK/XXX** no código-fonte TS do admin-api (grep em `app/ start/ config/ contracts/ commands/ providers/ tests/ database/ env.ts server.ts` — zero ocorrências). [CODIGO]

---

## 9. Resumo executivo

- **O que é:** API administrativa AdonisJS 5 autenticada por OAT (`partner_api_tokens`), com CRUD de partners internos (roles SYSTEM_DIRECTOR/SYSTEM_MANAGER), leitura de clientes/coworkings (mirrors read-only), suspensão/reativação soft de usuários, dashboard de métricas e health checks. Audit logging próprio (`admin_audit_logs`).
- **Estado:** código limpo e organizado (sem TODOs), com boas práticas (audit fire-and-forget, security headers, rate limit no login, proteção contra autodeleção/rebaixamento de diretor).
- **Risco principal de integração:** **o frontend atual não consome este admin-api** — a superfície admin real do frontend (audit-logs, discounts, subscriptions, webhook-dlq) vive no workeaser-api; o admin-api analisado parece órfão ou destinado a um consumidor não encontrado nesta análise.
- **Testes:** insuficientes e em parte quebrados (1 stub + 1 mock de login desatualizado).
- **Dívida técnica:** RateLimit in-memory; CI Node 14 vs runtime Node 20+; models mirrors sem migrations locais; alguns campos/enums/middlewares mortos.

### Evidências principais (caminhos)
- Rotas: `start/routes.ts`, `start/routes/{auth,partners,clients,dashboard}.ts`, `start/kernel.ts`
- Controllers: `app/Controllers/Http/{Auth,Clients,Dashboard,Partners}Controller.ts`
- Services: `app/Services/{AuthService,PartnerService,ClientsService,DashboardService,AdminAuditService}.ts`
- Models: `app/Models/{User,Partner,ClientAccount,CoworkAccount,Location,AdminAuditLog}.ts`
- Migrations: `database/migrations/*.ts` (4 arquivos); Seeder: `database/seeders/Partner.ts`
- Middlewares: `app/Middleware/{Auth,AdminRole,RateLimit,SecurityHeaders,SilentAuth}.ts`
- Validators: `app/Validators/{CreatePartnerValidator,UpdatePartnerValidator,ListClientsValidator}.ts`
- Testes: `tests/functional/auth/login.spec.ts`, `tests/functional/healthcheck.spec.ts`, `tests/bootstrap.ts`, `test.ts`
- Config: `config/{auth,database,app,cors,hash,bodyparser,drive}.ts`, `env.ts`, `.adonisrc.json`, `package.json`, `Dockerfile.admin-api`, `.github/workflows/{ci,cd}.yml`
- Cross-checks frontend: `src/workeaser-frontend/workeaser-management-frontend-main/` → `src/services/apiClient/index.ts`, `src/services/api/auth/index.ts`, `src/services/api/index.ts`, `src/pages/admin/*`, `next.config.js`
- Cross-check workeaser-api: `src/workeaser-api/workeaser-management-api-main/start/routes/admin/{auth,auditlogs,discounts,subscriptions,webhookdlq}.ts`
