# Workeaser — Infraestrutura e Deploy (10)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CONFIG] · [CODIGO] · [RUNTIME] · [NAO_CONFIRMADO]

---

## 1. Ambiente atual (único: desenvolvimento local)

- **Host:** PC Windows 11 (Razer-2024), Docker Desktop
- **4 containers:** workeaser-frontend (3005→3000), workeaser-api (3333), workeaser-admin-api (3334), workeaser-mysql (3307→3306) [RUNTIME — docker ps]
- **Restart policy:** unless-stopped [CONFIG — compose.pc.yml]
- **Frontend URL:** http://localhost:3005

## 2. Docker / Compose

| Arquivo | Papel |
|---|---|
| compose.pc.yml | 4 serviços; envs montados como volume :ro; frontend build via Dockerfile.frontend-patch; portas mapeadas |
| Dockerfile.workeaser-api | Build da API (npm) |
| Dockerfile.admin-api | Build do admin-api (EXPOSE 3334) |
| Dockerfile.frontend-pc | Build frontend: corepack+yarn install --frozen-lockfile + next build com patch echarts SSR |

**Subir:**
```bash
cd A:\Claude-Deep\Temp\workeaser-arm64\workeaser
docker compose -f compose.pc.yml --env-file .env.docker up -d
```
**Derrubar:**
```bash
docker compose -f compose.pc.yml down
```

## 3. Variáveis de ambiente

| Arquivo | Conteúdo |
|---|---|
| env-pc/workeaser-api.env | 45 vars (APP_KEY, DB, CORS, Stripe, Plaid, Google, Docusign, Exchange, AdobeSign, AWS/SES, Mapbox, RateLimit) |
| env-pc/admin-api.env | 12 vars (APP_KEY, DB) |
| .env.docker | build frontend: NEXT_PUBLIC_API_URL, MAPBOX, POSTHOG, SENTRY, RATE_LIMIT_*, STRIPE (teste), DOCUSIGN, PLAID |

**Segredos:** armazenados em arquivos .env locais. Não confirmado se estão no .gitignore [NAO_CONFIRMADO].

## 4. CI/CD e GitHub Actions

- .github/workflows/ existe nos 3 apps [CODIGO — existência]
- Nenhum pipeline ativo confirmado [NAO_CONFIRMADO]
- Deploy de produção: NÃO EXISTE

## 5. Build

| App | Comando/processo |
|---|---|
| workeaser-api | Dockerfile: npm install + build TS |
| admin-api | Dockerfile: npm install + build TS |
| frontend | Dockerfile.frontend-pc: corepack enable + yarn install --frozen-lockfile + NEXT_IGNORE_BUILD_ERRORS=true + patch echarts (Chart via next/dynamic ssr:false) |

**Problema de build conhecido:** echarts quebra SSR ("window is not defined") — resolvido com wrapper next/dynamic; imports mortos removidos em 2 páginas [CODIGO + memória deploy 22/07].

## 6. Migrations

- Comando: `node ace migration:run --force` (--force obrigatório — sem ele sai silencioso com exit 0) [CODIGO/memória]
- Migration problemática conhecida: 1679921348040 (chats.uuid) falha com "Duplicate column" mas aplica tudo — marcar manual em adonis_schema [memória]

## 7. Health checks

- workeaser-api: /health, /health/db (SELECT 1), /health/version [CODIGO]
- admin-api: /healthz, /health, /health/db, /health/version [CODIGO]
- Confirmado: API 200 (3ms), admin 200 (101ms) [RUNTIME]

## 8. Backups

| Backup | Local |
|---|---|
| Deploy completo (dump 294KB, compose, envs, seeders, import script) | backups/workeaser-orlando-2026-07-23/ |
| Pré-troca de senhas (dump 347KB) | backups/workeaser-passwords-2026-08-06/ |
| **Offsite** | ❌ NÃO EXISTE [NAO_CONFIRMADO] |

## 9. Monitoramento / observabilidade

- Sentry: NEXT_PUBLIC_SENTRY_DSN + SENTRY_DSN_* nos envs [CONFIG]
- PostHog: NEXT_PUBLIC_POSTHOG_HOST/KEY [CONFIG]
- Ativação em runtime: não confirmada [NAO_CONFIRMADO]

## 10. Histórico de deploy

| Data | Evento | Resultado |
|---|---|---|
| 20-22/07 | Deploy NAS Synology (ARM64) | ❌ Falhou — 512MB RAM, QEMU emulação |
| 22/07 | Deploy PC (Docker Desktop) | ✅ 4 containers healthy, 110 tabelas |
| 23/07 | Importação QBO (240 clientes) | ✅ |
| 06/08 | Troca de senhas + fix CORS + email_confirmed | ✅ |

## 11. Processo documentado para preparar ambiente local

1. Instalar Docker Desktop (Windows)
2. Clonar/copiar fonte para A:\Claude-Deep\Temp\workeaser-arm64\workeaser\
3. Configurar envs (env-pc/*.env + .env.docker)
4. `docker compose -f compose.pc.yml --env-file .env.docker up -d`
5. Migrations: `docker exec -e NODE_ENV=production workeaser-api node ace migration:run --force` (com --force)
6. Seeds (se necessário): `docker exec -e NODE_ENV=testing workeaser-api node ace db:seed`
7. Acessar http://localhost:3005

## 12. Etapas não comprovadas

- Instalar dependências localmente (sem Docker) — não comprovado [NAO_CONFIRMADO]
- Executar testes — somente admin-api tem tests/functional; execução não confirmada [NAO_CONFIRMADO]
- Publicar (deploy produção) — NÃO EXISTE [NAO_CONFIRMADO]
- Rollback — backup local existe (restore via `mysql < dump.sql`); rollback de app não documentado [NAO_CONFIRMADO]
- Kubernetes — NÃO [NAO_CONFIRMADO]
- DNS/SSL/domínio — NÃO [NAO_CONFIRMADO]
