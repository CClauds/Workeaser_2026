# Workeaser — Índice de Evidências (17)

> **Data:** 06/08/2026 — Todas as evidências verificáveis usadas na auditoria.
> **Legenda:** [CODIGO] confirmado no código · [CONFIG] confirmado em configuração · [BANCO] confirmado por query · [RUNTIME] confirmado em execução · [TESTE] confirmado por teste · [INTERFACE] confirmado em navegador · [NAO_CONFIRMADO]

---

## 1. Código-fonte

### workeaser-api (`A:\Claude-Deep\Temp\workeaser-arm64\workeaser\src\workeaser-api\workeaser-management-api-main\`)
| Arquivo | Evidência |
|---|---|
| start/routes.ts | Registro central de todas as rotas |
| start/routes/auth.ts | Login/signup/import (import sem middleware) |
| start/routes/me.ts | Perfil, LGPD, 2FA |
| start/routes/cowork/*.ts | ~30 arquivos: rotas cowork com middleware de módulo |
| start/routes/client/*.ts | Rotas client com clientAuthorization |
| start/routes/admin/*.ts | Rotas admin com adminAuthorization |
| start/routes/webhooks/*.ts | 6 webhooks |
| start/kernel.ts | Middlewares globais e nomeados |
| start/events/user.ts | Evento user:email_confirmed → onboarding |
| start/bouncer.ts | Políticas RBAC |
| app/Controllers/Http/* | 63 controllers |
| app/Models/* | 108 models |
| app/Tasks/* | 8 tasks com schedule |
| app/Integrations/Payments/Implementation/StripeImplementation.ts | Stripe (385 linhas) |
| app/Integrations/BankReconciliation/Implementation/PlaidImplementation.ts | Plaid (185) |
| app/Integrations/Whatsapp/MetaCloudImplementation.ts | WhatsApp (122) |
| app/Integrations/ESignature/Implementation/DocusignImplementation.ts | Docusign (159) |
| app/Integrations/AdobeSign/Implementation/AdobeSignImplementation.ts | AdobeSign (82) |
| app/Integrations/BoldSign/implemetation/BoldSign.impl.ts | BoldSign (250) |
| app/Middleware/{Auth,SilentAuth,CoworkAuthorization,ClientAuthorization,AdminAuthorization,BoldSignValidation,RateLimit,SecurityHeaders,LoggerMiddleware}.ts | Middlewares |
| config/auth.ts | Guard OAT |
| config/hash.ts | argon2id (t=3, m=4096, p=1) |
| config/cors.ts | Allowlist CORS_ALLOWED_ORIGINS |
| .adonisrc.json | Preloads/providers (adonis5-scheduler presente) |
| server.js | `Ignitor.httpServer().start()` — SEM scheduler |
| package.json | Dependências |

### admin-api (`...\src\admin-api\admin-management-api-main\`)
| Arquivo | Evidência |
|---|---|
| start/routes.ts + routes/{auth,partners,clients,dashboard}.ts | 20 rotas |
| start/kernel.ts | SilentAuth NÃO registrado |
| app/Controllers/Http/{Auth,Partners,Clients,Dashboard}Controller.ts | 4 controllers |
| app/Services/{Auth,Partner,Clients,Dashboard,AdminAudit}Service.ts | Services |
| app/Models/{Partner,User,ClientAccount,CoworkAccount,Location,AdminAuditLog}.ts | Models (mirrors read-only) |
| database/migrations/ | 4 migrations |
| tests/functional/ | Testes |

### workeaser-frontend (`...\src\workeaser-frontend\workeaser-management-frontend-main\`)
| Arquivo | Evidência |
|---|---|
| src/pages/** (~130 .tsx) | Todas as rotas |
| src/components/Sidebar/index.tsx | Menu + módulos |
| src/components/Header/index.tsx | Header |
| src/components/Menus/QuickactionsMenu/index.tsx | Quick Actions |
| src/components/Modals/index.tsx | 7 modais |
| src/components/Layouts/* | Layouts |
| src/components/Client/MemberSidebar/index.tsx | Sidebar do cliente (ativo) |
| src/components/Menus/MemberSidebar | Legado (não importado) |
| src/contexts/{AuthContext,MenuContext,SpacesContext}.tsx | Contextos |
| src/services/apiClient/index.ts | axios + token |
| src/services/api/middleware.ts | SWR auth |
| src/services/api/auth/index.ts | signInRequest/logout |
| src/services/api/cowork/financial/index.ts | getTax → /cowork/Taxs (inconsistente) |
| src/pages/index.tsx | Landing (CTA /signup quebrado) |
| src/pages/client/index.tsx | Página vazia |
| src/pages/settings/integrations, payments | Páginas vazias |
| src/pages/dashboard/index.tsx | Dashboard (cards + gráficos) |

## 2. Configuração
| Arquivo | Evidência |
|---|---|
| env-pc/workeaser-api.env | 45 vars (CORS atualizado 06/08, Stripe teste, placeholders) |
| env-pc/admin-api.env | 12 vars |
| .env.docker | Build frontend (NEXT_PUBLIC_*, RATE_LIMIT_*, STRIPE teste) |
| compose.pc.yml | 4 serviços, portas, volumes :ro |

## 3. Banco (queries SELECT/SHOW via docker exec)
| Query | Evidência |
|---|---|
| information_schema.tables | 108 tabelas + row counts |
| information_schema.key_column_usage | 7 FKs |
| SHOW COLUMNS (várias tabelas) | Schema real |
| SELECT users/api_tokens/cowork_*/locations/services/VO/meetrooms/desks/plans/logs/photos | Dados atuais |

## 4. Runtime
| Evidência | Fonte |
|---|---|
| docker ps | 4 containers healthy |
| /proc/1/cmdline (workeaser-api) | `tini -- node server.js` (sem scheduler) |
| docker logs workeaser-api | BoldSign Invalid URL (23/07); LOGIN_SUCCESS (06/08) |
| curl /health/db | 200 (3ms/101ms) |
| POST /api/auth/login (admin + 4 clientes) | 200 PASS |
| POST /api/auth/login (medstation email composto) | 422 VALIDATION_ERROR |
| Browser login | PASS — dashboard carregado |
| Browser fetch → API (CORS) | Failed to fetch antes do fix; PASS após CORS update |

## 5. Testes
| Evidência | Fonte |
|---|---|
| tests/functional (admin-api) | Existência [CODIGO]; execução não confirmada |
| src/tests (frontend) | Existência [CODIGO] |

## 6. Documentação anterior e apoio
| Item | Local |
|---|---|
| Docs sessão 06/08 | A:\Claude-Deep\docs\workeaser-doc\ (6 + 4 arquivos) |
| Memórias | A:\Claude-Deep\memory\06-workeaser\ |
| import-qbo-customers.py | A:\Claude-Deep\Temp\ (hash bcrypt — bug origem) |
| Backups | backups/workeaser-orlando-2026-07-23/, backups/workeaser-passwords-2026-08-06/ |
| Credenciais novas (SENSÍVEL) | A:\Claude-Deep\Temp\workeaser-new-passwords.json |

## 7. Endpoints testados em runtime (06/08)
| Endpoint | Método | Resultado |
|---|---|---|
| http://localhost:3005 | GET | 200 login |
| http://172.16.4.26:3333/health/db | GET | 200 |
| http://localhost:3334/health/db | GET | 200 |
| /api/auth/login (admin) | POST | 200 token |
| /api/auth/login (clientes amostrais) | POST | 200 token |
| /api/auth/login (email composto) | POST | 422 |
| /api/cowork/boldsign/identities/me | GET | 500 (logs 23/07) |

## 8. Resumos de subagentes (delegation 06/08)
| Item | Local |
|---|---|
| Resumo workeaser-api (rotas+middlewares módulo) | cache/delegation/subagent-summary-0-20260806_115221_208275.txt |
| Resumo admin-api | subagent-summary-1-20260806_115221_209270.txt |
| Resumo frontend | subagent-summary-2-20260806_115221_210266.txt |
| Resumo frontend (2º, incremental) | subagent-summary-0-20260806_115930_524317.txt |
