# Workeaser — Inventário do Projeto (01)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] · [CONFIG] · [BANCO] · [RUNTIME] · [NAO_CONFIRMADO]

---

## 1. Repositórios e diretórios

### 1.1 Estrutura raiz do projeto

```
A:\Claude-Deep\Temp\workeaser-arm64\workeaser\
├── compose.pc.yml              ← Docker Compose local (4 serviços) [CONFIG]
├── .env.docker                 ← Variáveis de build do frontend [CONFIG]
├── env-pc/
│   ├── workeaser-api.env       ← 45 variáveis do workeaser-api [CONFIG]
│   └── admin-api.env           ← 12 variáveis do admin-api [CONFIG]
├── Dockerfile.frontend-pc      ← Build do frontend (yarn + patch SSR echarts) [CONFIG]
├── Dockerfile.workeaser-api    ← Build da API [CONFIG]
├── Dockerfile.admin-api        ← Build do admin-api [CONFIG]
├── delivery_workeaser_final_master/  ← Pacote de entrega (packages, owner kit) [NAO_CONFIRMADO conteúdo]
├── src/
│   ├── workeaser-api/workeaser-management-api-main/   ← API principal (AdonisJS 5)
│   ├── admin-api/admin-management-api-main/           ← Admin API (AdonisJS 5)
│   └── workeaser-frontend/workeaser-management-frontend-main/ ← Frontend (Next.js)
└── build-arm64.ps1             ← Script de cross-build ARM64 (inútil pro NAS) [CODIGO]
```

### 1.2 Tamanhos

| App | Tamanho | Linguagem |
|---|---|---|
| workeaser-api | 4.4 MB | TypeScript (AdonisJS 5) |
| admin-api | 68 MB (inclui node_modules_temp) | TypeScript (AdonisJS 5) |
| workeaser-frontend | 5.9 MB | TypeScript (Next.js) |

### 1.3 Contagem de artefatos

| Item | Quantidade | Evidência |
|---|---|---|
| Controllers workeaser-api | 63 | [CODIGO — app/Controllers/Http] |
| Models workeaser-api | 108 | [CODIGO — app/Models] |
| Tasks (background) | 8 | [CODIGO — app/Tasks] |
| Rotas workeaser-api | ~170 endpoints | [CODIGO — start/routes/*] |
| Rotas admin-api | 20 | [CODIGO — start/routes/*] |
| Páginas frontend | ~130 (.tsx) | [CODIGO — src/pages] |
| Tabelas MySQL | 108 | [BANCO] |
| Migrations aplicadas | 289 (adonis_schema) | [BANCO] |

---

## 2. Linguagens e frameworks

| Camada | Tecnologia | Versão | Evidência |
|---|---|---|---|
| Backend API | AdonisJS 5 (Node.js) | Core ^5.9 | [CODIGO — package.json] |
| ORM | Lucid | ^18 | [CODIGO — package.json] |
| Auth | @adonisjs/auth (OAT) | ^8 | [CODIGO — package.json] |
| RBAC | @adonisjs/bouncer | — | [CODIGO — .adonisrc.json] |
| Scheduler | adonis5-scheduler | ^2.0.2 | [CODIGO — package.json] |
| Admin API | AdonisJS 5 | Core ^5.9.0 | [CODIGO — package.json] |
| Frontend | Next.js | — (engine node >=20) | [CODIGO — package.json frontend] |
| Frontend libs | SWR, axios, echarts, styled-components, Mapbox, Stripe.js | — | [CODIGO] |
| Banco | MySQL 8.4 | — | [CONFIG + BANCO] |

---

## 3. Pontos de entrada

| App | Entrypoint | Porta | Evidência |
|---|---|---|---|
| workeaser-api | `server.js` → `Ignitor.httpServer().start()` | 3333 | [CODIGO — server.js] |
| admin-api | `server.js` → `Ignitor.httpServer().start()` | 3334 | [CODIGO + CONFIG] |
| workeaser-frontend | Next.js (`next start`) | 3005 (3005→3000 no container) | [CONFIG — compose.pc.yml] |
| MySQL | container workeaser-mysql | 3307 (host) → 3306 | [CONFIG] |

---

## 4. Arquivos de configuração e variáveis de ambiente

### 4.1 workeaser-api.env (45 variáveis) [CONFIG]
APP_KEY, APP_NAME, APP_URL, NODE_ENV, HOST, PORT, ITEMS_PER_PAGE, CORS_ALLOWED_ORIGINS (atualizado 06/08: inclui :3005), DB_*, DRIVE_DISK, AWS_ACCESS_KEY/SECRET/REGION, SES_MAIL_FROM/NAME, GOOGLE_CLIENT_ID/SECRET/URI_REDIRECT, EXCHANGE_CLIENT_ID/SECRET/REDIRECT_URI/AUTHORITY, DOCUSIGN_* (SANDBOX=true), STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET_KEY, PLAID_CLIENT_ID/SECRET/NAME, ADOBE_SIGN_API, AUTHORIZATION_ADOBE_SIGN, CLIENTID_ADOBE_SIGN, MAPBOX_API_KEY, RATE_LIMIT_*

### 4.2 admin-api.env (12 variáveis) [CONFIG]
APP_KEY, APP_NAME, NODE_ENV, HOST, PORT, DB_CONNECTION, MYSQL_*, DRIVE_DISK

### 4.3 .env.docker (build frontend) [CONFIG]
NEXT_PUBLIC_API_URL, NEXT_PUBLIC_ADMIN_API_URL, NEXT_PUBLIC_MAPBOX_KEY, NEXT_PUBLIC_POSTHOG_HOST/KEY, NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN_*, STRIPE_SECRET_KEY (sk_test_local), STRIPE_WEBHOOK_SECRET (whsec_local), PLAID_*, DOCUSIGN_*, RATE_LIMIT_AUTH_*

**Credenciais placeholder detectadas [CONFIG]:** GOOGLE_CLIENT_ID/SECRET = "placeholder...", DOCUSIGN_INTEGRATION_KEY/USER_ID = "placeholder...", PLAID_CLIENT_ID = "placeholder...", EXCHANGE_CLIENT_ID = "placeholder...", AWS = local-dev, MAPBOX = pk.local.

---

## 5. Frontend, backend, banco, serviços, workers, integrações

| Componente | Onde | Status |
|---|---|---|
| Frontend | workeaser-frontend (Next.js) | ✅ roda (:3005) |
| Backend principal | workeaser-api (AdonisJS) | ✅ roda (:3333) |
| Backend admin | admin-api (AdonisJS) | ✅ roda (:3334) |
| Banco | MySQL 8.4 | ✅ roda (:3307) |
| Workers/tasks | app/Tasks (8) via adonis5-scheduler | 🔴 scheduler NÃO roda [RUNTIME] |
| Filas | email_queue, webhook_dead_letter_queue (tabelas) | 🔴 vazias; consumers não rodam |
| Integrações | Stripe, Plaid, WhatsApp, SES, Docusign, AdobeSign, BoldSign, Google/Exchange | 🟡 parciais (ver 08) |

---

## 6. Ambientes

| Ambiente | Existência | Evidência |
|---|---|---|
| Desenvolvimento | ✅ PC local via Docker (compose.pc.yml) | [CONFIG] |
| Homologação | ❌ Não identificado | [NAO_CONFIRMADO] |
| Produção | ❌ Não identificado (nenhum domínio/VPS/SSL) | [NAO_CONFIRMADO] |
| Teste | NODE_ENV=testing para seed (pino-pretty ausente em development) | [CODIGO — seeders] |

---

## 7. Infraestrutura, deploy, containers, automações

| Item | Arquivo | Evidência |
|---|---|---|
| Docker Compose | compose.pc.yml (4 serviços, restart: unless-stopped) | [CONFIG] |
| Dockerfiles | Dockerfile.frontend-pc, Dockerfile.workeaser-api, Dockerfile.admin-api | [CONFIG] |
| GitHub Actions | .github/workflows/ (nos 3 apps) | [CODIGO — existência; conteúdo não analisado] |
| CI/CD | ❌ Não executado (sem pipeline ativo confirmado) | [NAO_CONFIRMADO] |
| Backup | backups/workeaser-orlando-2026-07-23/ (dump 294KB + envs) e backups/workeaser-passwords-2026-08-06/ | [BANCO/arquivo] |
| Deploy NAS | workeaser-deploy-nas (falhou — RAM 512MB) | [memória 06-workeaser] |

---

## 8. Testes existentes

| App | Testes | Evidência |
|---|---|---|
| admin-api | tests/functional/ (existem) | [CODIGO — diretório] |
| workeaser-api | Não encontrados | [NAO_CONFIRMADO] |
| frontend | src/tests/ (diretório existe) | [CODIGO — existência; conteúdo não analisado] |

---

## 9. Documentação anterior

| Documento | Local |
|---|---|
| Documentação da sessão de análise 06/08 | A:\Claude-Deep\docs\workeaser-doc\ (6 arquivos + 4 análises) |
| Memórias do projeto | A:\Claude-Deep\memory\06-workeaser\ (deploy NAS/PC, councils, sunbiz) |
| Council 27/07 | council-transcript-2026-07-27.md |
| Council 04/08 (robustez) | council-transcript-2026-08-04.md |

---

## 10. Código legado, duplicado, desativado, abandonado

| Item | Tipo | Evidência |
|---|---|---|
| `membership/[id]/*` (sem "client/") | Duplicado/legado (o ativo é client/membership) | [CODIGO] |
| `Menus/MemberSidebar` | Não importado por ninguém | [CODIGO] |
| `SilentAuth` (admin-api) | Middleware morto (não registrado) | [CODIGO] |
| `Model Location` (admin-api) | Sem uso (dashboard usa query crua) | [CODIGO] |
| Landing `/` chaves localStorage | Legado de auth antigo | [CODIGO] |
| `POST /api/auth/import` | Endpoint sem middleware, exposto | [CODIGO] |
| 81 tabelas vazias | Estrutura completa nunca usada | [BANCO] |
| Omnichat, Marketplace, Community, My Membership | Comentados no frontend | [CODIGO] |
| build-arm64.ps1 | Inútil (NAS aposentado) | [CODIGO] |
| AdobeSign | "legado, desativado" (segundo subagente) | [CODIGO] |
| getTax → `/cowork/Taxs` | Endpoint com maiúscula inconsistente | [CODIGO] |
