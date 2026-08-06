# Workeaser — Auditoria Técnica Completa (00 — Resumo Executivo)

> **Data:** 06/08/2026
> **Modo:** 100% leitura. Nenhum arquivo, banco, configuração ou dado foi alterado.
> **Escopo:** workeaser-api (AdonisJS 5), admin-api (AdonisJS 5), workeaser-frontend (Next.js), MySQL 8.4 (108 tabelas), 4 containers Docker.
> **Evidências:** [CODIGO] = confirmado no código · [CONFIG] = confirmado em configuração · [BANCO] = confirmado por query · [RUNTIME] = confirmado em execução/logs · [TESTE] = confirmado por teste · [NAO_CONFIRMADO] = não foi possível confirmar · "Interpretação técnica" = inferência explícita.

---

## 1. O que é o sistema

O **Workeaser** é uma plataforma de gestão de coworking composta por 3 aplicações: **workeaser-api** (API principal, porta 3333), **admin-api** (API administrativa interna, porta 3334) e **workeaser-frontend** (Next.js, porta 3005), sobre um MySQL 8.4 compartilhado (108 tabelas). Roda localmente em Docker Desktop com dados reais da Easy Work Space Orlando (10 unidades, 240 clientes importados do QBO, 7 planos de Virtual Office).

## 2. Veredito técnico geral

| Dimensão | Avaliação |
|---|---|
| Arquitetura | Sólida e modular (controllers → services → models → integrações), padrão AdonisJS 5 + Next.js |
| Funcional (catálogo) | ✅ Funciona: login, dashboard, CRUD de locations/services/clientes, auditoria |
| Funcional (operação) | 🔴 81 das 108 tabelas VAZIAS — 0 invoices, 0 contracts, 0 payments, 0 meetings |
| Automação | 🔴 Scheduler INATIVO — 8 tasks definidas com cron, nenhuma executa |
| Integrações | 🟡 8 integrações implementadas no código; Stripe em modo TESTE; 5 com credenciais placeholder; BoldSign QUEBRADA em runtime |
| Produção | 🔴 Não existe — roda apenas no PC local, sem domínio/SSL/VPS/CI/CD |
| Segurança | 🟡 Riscos: cookie sem httpOnly, rota de import exposta, emails compostos, credenciais placeholder |
| Testes | 🔴 Quase inexistentes (apenas tests/functional do admin-api encontrados) |
| Concorrência (produto) | 🔴 Não compete como produto hoje; é protótipo funcional com catálogo real |

## 3. Achados críticos (P0)

1. **Scheduler de tasks não roda** — 8 automações (faturas, vencidos, LGPD, email, WhatsApp, retry webhook, renovação de contrato, reconciliação Plaid) definidas no código mas o container executa apenas `node server.js`; o `node ace scheduler:run` não é iniciado [RUNTIME — /proc/1/cmdline].
2. **Sistema sem produção** — roda no PC local (single point of failure); sem backup offsite, sem domínio, sem SSL [CODIGO + CONFIG].
3. **BoldSign quebrada** — `GET /api/cowork/boldsign/identities/me` → `TypeError: Invalid URL` (base URL relativa sem host) [RUNTIME — docker logs 23/07].
4. **Stripe em modo teste** — `sk_test_local`; nenhum fluxo de dinheiro real [CONFIG].
5. **81 tabelas vazias** — incluindo o núcleo operacional: invoices, contracts, payments, subscriptions, meetings, leads [BANCO].

## 4. Achados de segurança relevantes

- Cookie `user-token` **sem httpOnly** (linha comentada) — risco XSS [CODIGO — login/index.tsx]
- `POST /api/auth/import` **sem middleware** — endpoint de criação em massa de usuários exposto [CODIGO — routes/auth.ts]
- ~20 clientes com **email composto por vírgula** (herança QBO) — quebram validação de email no login [BANCO + RUNTIME]
- Integrações com **credenciais placeholder** (Google, Docusign, Plaid, Exchange) [CONFIG]
- Suspensão de usuário no admin-api é **soft delete** (`users.deleted_at`) — indistinguível de exclusão lógica [CODIGO]

## 5. O que funciona de fato (confirmado em execução)

- Login (admin + clientes amostrais) — PASS via API e navegador [RUNTIME]
- Dashboard admin (Active Locations 10, Active Members 239, Receivable Income $800.00) [RUNTIME + INTERFACE]
- CRUD de catálogo: 10 locations, 4 services, 7 VOs, 5 meetrooms, 4 desks [BANCO]
- 240 clientes + 244 users com senhas argon2id e email confirmado (sessão 06/08) [BANCO]
- Auditoria de login (tabela logs, 150 registros) [BANCO]
- Health checks (API 3ms, admin 101ms) [RUNTIME]

## 6. Contagem da análise

- **Repositórios/apps:** 3 (workeaser-api, admin-api, workeaser-frontend)
- **Telas/rotas frontend:** ~130 arquivos .tsx em src/pages
- **Endpoints backend:** ~200 rotas registradas (workeaser-api ~170 + admin-api 20)
- **Tabelas:** 108 (27 com dados, 81 vazias)
- **Integrações externas:** 8 (Stripe, Plaid, WhatsApp, SES, Docusign, AdobeSign, BoldSign, Google/Exchange Calendar)
- **Jobs/automações:** 8 tasks + 6 webhooks + 1 evento de onboarding
- **Testes:** tests/functional no admin-api (cobertura não confirmada); nenhum no workeaser-api encontrado
- **Concorrentes analisados (benchmark):** 10

## 7. Estrutura dos entregáveis

| Arquivo | Conteúdo |
|---|---|
| 00-resumo-executivo.md | Este resumo |
| 01-inventario-do-projeto.md | Inventário de arquivos, tecnologias, ambientes, pontos de entrada |
| 02-arquitetura-tecnica.md | Arquitetura, componentes, autenticação, async, build/deploy + Mermaid |
| 03-mapa-de-interface.md | Mapeamento completo de telas, menus, componentes |
| 04-funcionalidades-e-rastreabilidade.md | Rastreamento interface→backend→banco de cada função |
| 05-api-backend.md | Inventário de endpoints, tabela método/rota/perm/handler |
| 06-banco-de-dados.md | Estrutura, tabelas, relacionamentos, riscos |
| 07-autenticacao-e-permissoes.md | Login, tokens, perfis, matriz de permissões |
| 08-integracoes.md | 8 integrações externas detalhadas |
| 09-jobs-webhooks-e-automacoes.md | Tasks, webhooks, eventos |
| 10-infraestrutura-e-deploy.md | Docker, envs, build, deploy, rollback |
| 11-qualidade-seguranca-e-riscos.md | Qualidade, segurança, riscos classificados |
| 12-testes.md | Inventário de testes |
| 13-manual-do-desenvolvedor.md | Manual técnico para devs |
| 14-manual-do-usuario.md | Manual funcional |
| 15-matriz-de-implementacao.md | Matriz módulo/função/front/back/banco/teste |
| 16-debitos-tecnicos-e-proximos-passos.md | Backlog priorizado |
| 17-indice-de-evidencias.md | Índice de evidências |
| diagramas/*.mmd | 5 diagramas Mermaid |
| 18-25 (benchmark) | Análise competitiva de 10 concorrentes |
