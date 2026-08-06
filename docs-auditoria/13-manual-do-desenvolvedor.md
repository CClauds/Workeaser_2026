# Workeaser — Manual do Desenvolvedor (13)

> **Data:** 06/08/2026 — Procedimentos comprovados pelos arquivos do projeto. Marcações: ✅ comprovado · ❓ não comprovado.

---

## 1. Visão geral

- 3 apps: workeaser-api (AdonisJS 5, :3333), admin-api (AdonisJS 5, :3334), workeaser-frontend (Next.js, :3005)
- 1 MySQL 8.4 compartilhado (:3307), banco `workeaser_local`
- Fonte: `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\src\`
- Compose: `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\compose.pc.yml`

## 2. Estrutura de diretórios

```
workeaser-api/workeaser-management-api-main/
├── app/
│   ├── Controllers/Http/{Admin,Client,Cowork,Me,Utils,Webhooks}/
│   ├── Models/            (108)
│   ├── Services/{Admin,Client,Cowork}/
│   ├── Integrations/      (Stripe, Plaid, WhatsApp, eSign, calendar)
│   ├── Tasks/             (8)
│   ├── Middleware/        (Auth, *Authorization, RateLimit...)
│   ├── Validators/        (Auth, Client)
│   └── Utils/             (AppError, ResponseApi)
├── start/
│   ├── routes/            (admin, client, cowork, webhooks + gerais)
│   ├── events/            (user.ts — onboarding)
│   ├── kernel.ts          (middlewares)
│   ├── bouncer.ts         (políticas)
│   └── routes.ts          (registro central)
├── config/                (auth, hash, cors, database...)
├── database/migrations/   (289 aplicadas)
└── commands/              (ace)
```

```
workeaser-frontend/workeaser-management-frontend-main/src/
├── pages/                 (~130 rotas)
├── components/            (Layouts, Sidebar, Header, Modals, Chart...)
├── contexts/              (AuthContext, MenuContext, SpacesContext)
├── hooks/                 (useFetch, useDebounce...)
├── services/api/          (apiClient, auth, cowork/..., fileUpload, middleware)
├── types/  utils/  styles/  features/
```

## 3. Convenções

- TypeScript no backend e frontend
- Controllers finos → Services com a regra de negócio → Models Lucid
- Integrações: interface + Implementation (ex.: Payments.interface.ts + StripeImplementation.ts)
- Soft delete via deleted_at (base SoftDeleteBaseModel)
- Respostas padrão: responseWithSuccess({status:'OK', result, error:null})
- Erros: AppError(statusCode, message)
- Rotas: groups com prefix + middleware de módulo (coworkAuthorization:${CoworkModulesEnum.X})
- Comentários em português no backend (eventos, tasks)

## 4. Configuração local (comprovado)

1. Docker Desktop instalado
2. Fonte em `A:\Claude-Deep\Temp\workeaser-arm64\workeaser\`
3. Envs: `env-pc/workeaser-api.env`, `env-pc/admin-api.env`, `.env.docker`
4. Subir: `docker compose -f compose.pc.yml --env-file .env.docker up -d`
5. Acessar: http://localhost:3005

## 5. Banco de dados e migrations

- Acesso: `docker exec workeaser-mysql mysql -uworkeaser -pworkeaser_dev workeaser_local`
- Migrations: `docker exec -e NODE_ENV=production workeaser-api node ace migration:run --force` ✅ (--force obrigatório)
- Rollback de migration: não comprovado ❓
- Seeds: `docker exec -e NODE_ENV=testing workeaser-api node ace db:seed` ✅ (production pula DemoCoworkData)
- ⚠️ Migration 1679921348040 (chats.uuid) falha "Duplicate column" mas aplica — marcar manual em adonis_schema (histórico)

## 6. Executar o sistema (sem Docker) ❓

Não comprovado — o fluxo documentado é via Docker. Para desenvolvimento interno do app, os fontes usam npm/yarn (workeaser-api: npm; frontend: yarn v1) [CODIGO — package.json/lockfiles].

## 7. Logs e debugging

- Logs do container: `docker logs workeaser-api` (pino JSON) ✅
- Tabela logs (auditoria de ações): SELECT em workeaser_local.logs ✅
- Health: curl http://localhost:3333/health/db ✅
- ⚠️ NODE_ENV=development quebra por pino-pretty ausente — usar production/testing ✅ (histórico)

## 8. Criar um novo endpoint

1. Model em app/Models (se precisar)
2. Migration em database/migrations (convenção adonis:ace make:migration)
3. Controller em app/Controllers/Http/{Área}/
4. (Opcional) Service em app/Services/{Área}/
5. Rota em start/routes/{área}.ts com .prefix('api/...').middleware(['auth', `coworkAuthorization:${Módulo}`])
6. Registrar em start/routes.ts
7. Migration: `node ace migration:run --force`
8. Testar via curl/navegador

## 9. Criar uma nova página (frontend)

1. Arquivo em src/pages/{rota}.tsx
2. Layout: getLayout com CoworkingLayout/ClientLayout/etc.
3. Proteção: getServerSideProps com parseCookies(context) + getAPIClient(context) (redirect /login?expired=true sem token)
4. Dados: useFetch (SWR) com api.get
5. Registrar no sidebar (src/components/Sidebar/index.tsx) se for menu

## 10. Criar uma nova task (job)

1. Arquivo em app/Tasks/NomeTask.ts estendendo BaseTask (adonis5-scheduler)
2. `public static get schedule()` retorna cron
3. Executar manualmente: `node ace scheduler:run` (⚠️ precisa rodar como processo separado — o server.js não inicia o scheduler!)
4. Registrar provider se novo (adonis5-scheduler já está)

## 11. Adicionar uma integração

1. Interface em app/Integrations/{Nome}/  (ex.: Payments.interface.ts)
2. Implementation (ex.: StripeImplementation.ts)
3. Env vars em env-pc/workeaser-api.env
4. Controller/Serviço que a invoca
5. Webhook (se externo → cliente) em start/routes/webhooks/
6. Retry via DLQ (webhook_dead_letter_queue) se aplicável

## 12. Deploy e rollback

- Deploy: NÃO EXISTE processo de produção ❓
- Rollback de dados: restore dump (backups/) via `mysql < dump.sql` ✅ (comprovado no backup 06/08)
- Rollback de app: não documentado ❓

## 13. Problemas conhecidos

1. Scheduler não roda no container (falta `node ace scheduler:run`)
2. BoldSign Invalid URL (base URL relativa)
3. echarts quebra SSR — usar next/dynamic {ssr:false}
4. Migration chats.uuid "Duplicate column"
5. Client login quebrado por email composto (vírgula) — normalizar
6. CORS: atualizar CORS_ALLOWED_ORIGINS se mudar porta do frontend
7. seed em development quebra (pino-pretty ausente)
8. /cowork/Taxs maiúscula no frontend
