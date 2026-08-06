# Workeaser — Autenticação e Permissões (07)

> **Data:** 06/08/2026 — Modo 100% leitura
> **Evidências:** [CODIGO] · [CONFIG] · [BANCO] · [RUNTIME]

---

## 1. Mecanismo de autenticação

| Aspecto | Implementação | Evidência |
|---|---|---|
| Guard | `api` (OAT — Opaque Access Token) | [CODIGO — config/auth.ts workeaser-api e admin-api] |
| Token provider | database (tabela api_tokens / partner_api_tokens) | [CONFIG + BANCO] |
| Identifier | email (uids: ['email']) | [CODIGO — config/auth.ts] |
| Hash de senha | argon2id (t=3, m=4096, p=1) via @ioc:Adonis/Core/Hash | [CODIGO — config/hash.ts] |
| Expiração | expires_at (workeaser) / expiresIn '1days' (admin) | [CODIGO] |
| Refresh token | ❌ Não identificado | [NAO_CONFIRMADO] |
| 2FA | TOTP: status/setup/verify/disable | [CODIGO — Me/TwoFactorController] |
| Cookie sessão | `user-token` (nookies, sameSite strict, maxAge=expires_at, SEM httpOnly) | [CODIGO — login/index.tsx] |
| Rate limit | in-memory por IP+slot (35s), configurável via env RATE_LIMIT_AUTH_* | [CODIGO — RateLimit middleware + CONFIG] |

## 2. Fluxos de conta

| Fluxo | Endpoints | Status |
|---|---|---|
| Signup | POST /api/auth/signup | ✅ [CODIGO] |
| Email confirmation | POST /api/auth/email-confirmation + /resend | ✅ [CODIGO] |
| Lost password | POST /lost-password + /lost-password-confirmation | ✅ [CODIGO] |
| Convite de equipe (client) | POST /api/client/teams + acceptInvite | ✅ [CODIGO] |
| Convite de funcionário (cowork) | POST /api/cowork/employees + showInvite/acceptInvite públicos | ✅ [CODIGO] |
| Account deletion (LGPD) | POST/GET/DELETE /api/me/delete-account + /export-data | ✅ código; task não roda |
| Logout | POST /api/auth/logout (revoga token) | ✅ [CODIGO] |

## 3. Perfis e papéis

### 3.1 workeaser-api — users.role [BANCO + CODIGO]
| Role | Contagem | Acesso |
|---|---|---|
| ADMIN | 5 | Sidebar completa + /admin/* |
| COWORKING | 1 (demo) | Módulos do cowork |
| CLIENT | 238 | Portal cliente |

### 3.2 admin-api — partners.role [CODIGO]
| Role | Acesso |
|---|---|
| SYSTEM_DIRECTOR | CRUD de partners, suspend/unsuspend |
| SYSTEM_MANAGER | Somente leitura (listar) |

### 3.3 cowork_users.role (vínculo ao cowork) [BANCO]
| Role | Contagem |
|---|---|
| MANAGER | 6 |

## 4. Autorização (backend)

| Middleware | O que verifica | Evidência |
|---|---|---|
| auth | Bearer token OAT válido | [CODIGO — kernel.ts] |
| silentAuth | Auth opcional | [CODIGO] |
| coworkAuthorization:${Módulo} | user é COWORKING/ADMIN associado + módulo habilitado (cowork_user_modules) | [CODIGO — routes cowork] |
| clientAuthorization | user é CLIENT associado | [CODIGO — routes client] |
| adminAuthorization | user é ADMIN | [CODIGO — routes admin] |
| adminRole:SYSTEM_DIRECTOR | partner é diretor | [CODIGO — kernel.ts admin-api] |
| boldsignValidation | HMAC webhook BoldSign | [CODIGO] |
| rateLimit | in-memory IP+slot | [CODIGO] |

## 5. Matriz de permissões

| Perfil | Módulo | Visualizar | Criar | Editar | Excluir | Administrar |
|---|---|---|---|---|---|---|
| ADMIN | Todos | ✅ | ✅ | ✅ | ✅ | ✅ |
| COWORKING | Dashboard/Locations/Services/Relationship/Finances/Reports/Settings | ✅ (conforme cowork_modules) | ✅ (conforme módulo) | ✅ | ✅ | parcial (Team Members + Global Settings só MANAGER) |
| CLIENT | Membership/Bookings/Invoices/Mailbox/Chat | ✅ (próprios) | request/cancel | mailbox update | — | — |
| PARTNER SYSTEM_MANAGER | Admin partners/clients (leitura) | ✅ | ❌ | ❌ | ❌ | ❌ |
| PARTNER SYSTEM_DIRECTOR | Admin partners/clients | ✅ | ✅ | ✅ | ✅ (não auto-delete) | ✅ |
| Público | /spaces, /api/invoice/:uuid, /api/infos/* | ✅ | pay | — | — | — |

## 6. Permissões DECLARADAS vs VERIFICADAS

### Verificadas no backend (middleware na rota) [CODIGO]
- ✅ auth nas rotas protegidas
- ✅ coworkAuthorization:${Módulo} — verifica cowork_user_modules
- ✅ clientAuthorization, adminAuthorization, adminRole

### Declaradas mas não verificadas / lacunas
- ⚠️ **`POST /api/auth/import` sem middleware** — qualquer chamada HTTP cria users [CODIGO]
- ⚠️ **`POST /api/auth/admin` sem rateLimit** [CODIGO]
- ⚠️ **Rotas cowork sem módulo específico** (subscriptions, stripe-connect, taxes, status, virtualoffices, meetrooms tem MEETROOM): usam apenas `coworkAuthorization` genérico — qualquer COWORKING com vínculo acessa, mesmo sem módulo habilitado [CODIGO — rotas sem ${CoworkModulesEnum}]
- ⚠️ **Dashboard/search** usam só `auth` — qualquer role logado (incluindo CLIENT?) acessa os dados do cowork se souber o path [CODIGO — routes/cowork/dashboard.ts usa middleware(['auth'])]
- ⚠️ **Isolamento entre clientes**: clientAuthorization verifica vínculo, mas o escopo por unidade/empresa não foi verificado rota a rota [NAO_CONFIRMADO]
- ⚠️ **UI oculta vs backend**: o sidebar filtra por cowork_modules, mas rotas sem middleware de módulo podem ser acessadas por URL direta

## 7. Isolamento multi-inquilino

- O schema suporta multi-cowork (cowork_accounts.id em todas as tabelas), mas **há apenas 1 cowork_account** (Easy WorkSpace Orlando) [BANCO]
- CLIENT vê apenas seus dados via clientAuthorization (não verificado em profundidade) [NAO_CONFIRMADO]

## 8. Impersonation

- ❌ Não identificado [NAO_CONFIRMADO]

## 9. Sessão e tokens — resumo de riscos

1. Cookie `user-token` sem httpOnly → vulnerável a roubo via XSS [CODIGO]
2. Token no cookie + header Authorization (duplicado) [CODIGO]
3. Sem refresh token — 1 dia de vida [NAO_CONFIRMADO refresh]
4. Rate limit em memória (perde-se no restart do container) [CODIGO]
