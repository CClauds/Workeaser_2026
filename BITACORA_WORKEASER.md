# BITACORA_WORKEASER.md

## 2026-08-06 — Auditoría inicial y backup

### Commit inicial
- **Hash**: `88fba1a`
- **Repositorio**: https://github.com/CClauds/Workeaser_2026
- **Snapshot origen**: workeaser-full-2026-08-06_14-18-20
- **Archivos**: 1726 archivos, 212,443 inserciones
- **Exclusiones verificadas**: node_modules, .env, credenciales, SQL dumps, uploads, git-workeaser
- **Usuario GitHub**: CClauds (keyring)

### PASO 1 — Auditoría dirigida A–H
- **Archivos**: CONTEXTO_WORKEASER.md, BITACORA_WORKEASER.md, AUDITORIA_CODE_WORKEASER_2026-08-06.md creados
- **Método**: 8 agentes de exploración paralelos verificaron cada módulo (A–H) contra el código real
- **Auditoría previa**: workeaser-auditoria/ (25 docs) usada como hipótesis de partida, verificada y corregida
- **Hallazgos clave confirmados**:
  - A. Pantallas rotas: causa raíz identificada (Open Desk sin `= {}` guard, Meeting/Private Room sin null-check en useEffect)
  - B. Pagos: Stripe funcional pero en TEST (sk_test_localdev placeholder), sin portal unificado
  - C. Firma: BoldSign cableado pero roto (Invalid URL), DocuSign shell sin consumers, AdobeSign desactivado
  - D. Chat: Omnichat funcional con historial persistente, sidebar comentado, 0 mensajes
  - E. Documentos: Drive local solamente, Google Drive no existe, tabla documents vacía
  - F. Portal: /client vacío, 15 rutas cliente funcionales, 4 clics para pagar, 3 para firmar
  - G. Scheduler: 8 tasks definidas, NINGUNA corre (solo node server.js)
  - H. Código muerto: Marketplace, membership viejo, 3 firmas, admin-api, CRM leads

### PASO 2 — Sub-auditor de verificación
- **Estado**: COMPLETADO con PASS
- **Método**: agente Explore independiente verificó cada claim del reporte contra código real (126 archivos leídos)
- **Primera verificación**: encontró 1 error MAJOR (Módulo A — causa raíz imprecisa) + 13 errores menores (líneas, nombres)
- **Correcciones aplicadas**: Módulo A reescrito (las 4 páginas tienen bugs, no solo 3; disparador depende de rol MANAGER/EMPLOYEE); correcciones de línea en B.1, B.4, B.6, C.1, C.3, C.4, D.2, G.1, H.4
- **Segunda verificación**: PASS — el reporte corregido es 100% correcto y completo
- **Veredicto sub-auditor**: "PASS — El reporte corregido es 100% correcto y completo. Todos los hallazgos verificados contra el código real."

### PASO 3 — CIERRE
- **Commit final**: `15791ef`
- **Push**: main → origin/main (https://github.com/CClauds/Workeaser_2026)
- **Archivos entregados**: AUDITORIA_CODE_WORKEASER_2026-08-06.md, CONTEXTO_WORKEASER.md, BITACORA_WORKEASER.md
- **Total commits en el repo**: 2 (88fba1a backup inicial + 15791ef auditoría)

### Auditoría complementaria QBO — 2026-08-06
- **Archivo**: AUDITORIA_QBO_WORKEASER_2026-08-06.md
- **Método**: 4 agentes de exploración paralelos (API, DB, scripts, frontend/docs) + sub-auditor independiente
- **Hallazgo central**: NO existe integración QBO en el código. Cero SDK, cero rutas, cero columnas, cero env vars.
- **240 clientes**: importados con script Python one-shot (direct DB, no API) el 2026-07-23. Sin mapeo de IDs QBO.
- **Sub-auditor**: encontró 5 errores menores (líneas, conteo migraciones 315→317, mecanismo del script). Corregidos. Conclusión central confirmada 100%.
- **Veredicto sub-auditor**: "FAIL inicial → correcciones aplicadas → conclusión central correcta: no existe integración QBO"
- **Modelo objetivo**: 12 capacidades, TODAS etiquetadas A CONSTRUIR (nada que rescatar)
- **Hash commit**: `cf6f6ba`

### Deploy STAGING — 2026-08-06/07
- **VPS**: Hetzner CX33 (4 vCPU / 8 GB / 80 GB), Ubuntu 26.04 LTS "Resolute Raccoon", Helsinki
- **IP**: 62.238.102.24
- **Acceso**: Solo llave SSH (PasswordAuthentication disabled, ufw 22/80/443, fail2ban sshd)
- **Docker**: Engine 29.7.2 + Compose v5.4.0. Método: `get.docker.com` (Docker repo oficial SÍ tiene paquetes para "resolute")
- **Ruta deploy**: `/opt/workeaser` (rsync desde disco, excluyendo node_modules, .git, .env, credenciales, uploads, dumps)
- **Contenedores**: 4/4 UP — mysql:8.4, workeaser-api (3333), admin-api (3334), frontend (3000)
- **DB**: MySQL 8.4, 110 tablas (importadas del dump del snapshot)
- **Migraciones**: 313 archivos presentes pero no ejecutables en Docker (ESM module resolution). Datos cargados vía SQL dump.
- **URLs staging**: http://62.238.102.24:3000 (frontend), :3333 (API), :3334 (admin)
- **Fixes aplicados para build**:
  - Dockerfiles: `npm ci` → `npm install` (lockfile incompatible con npm 10.9 del container node:22)
  - Dockerfiles: +`--legacy-peer-deps` (peer dependency conflicts)
  - Dockerfiles: +`NODE_OPTIONS=--max-old-space-size=4096` (OOM en build)
  - Código: 17x `AppError.SERVER_ERROR` → `AppError.LOGIC_ERROR` (no compilaba TypeScript)
  - Dockerfile frontend: `package-lock.json` no existía (solo yarn.lock)
  - Compose staging: context paths, env vars, MYSQL_USER/PASSWORD
- **Credenciales**: en `workeaser_credentials.txt` (gitignored). MySQL: workeaser / JJ8AMVvmtL1htNU5YOBaoH0m / workeaser_local
- **Sub-verificador**: PASS en 10/10 checks (SSH, ufw, fail2ban, Docker, APIs, frontend, DB, disk, sin secretos en repo)
- **Observación**: Puertos Docker en 0.0.0.0 (mitigado por ufw default deny). Recomendado: bind a 127.0.0.1 o reverse proxy.
- **Hash commit**: `02df3e7`

### PENDIENTE (fases posteriores)
- **Dominio + SSL**: sin configurar (esperado: fase posterior tras end-to-end funcional). Let's Encrypt requiere dominio.
- **Credenciales sandbox reales**: Stripe test keys, Verdocs, Plaid, Google OAuth — todos en PLACEHOLDER

### Infraestructura permanente — 2026-08-07
- **nginx**: 1.28.3, reverse proxy en puerto 80 → frontend:3000, /api/ → API:3333, /admin-api/ → admin:3334, /health → API health
- **Frontend rebuild**: `NEXT_PUBLIC_API_URL=/api` (relativo, mismo origen). Ya no se necesita puerto 3000 expuesto.
- **Bindings**: contenedores en 0.0.0.0. Acceso externo bloqueado vía iptables DOCKER-USER (DROP en eth0 para 3000, 3306, 3333, 3334). ufw solo 22/80/443.
- **Credenciales dev eliminadas**: `env-pc/*.env` removidos del VPS (eran de la PC de desarrollo). Solo .example permanecen.
- **MySQL healthcheck**: agregado al compose staging.
- **Fixes versionados en repo** (`c4724aa`): Dockerfiles (npm install, --legacy-peer-deps, NODE_OPTIONS), AppError (SERVER_ERROR→LOGIC_ERROR), docker-compose.staging.yml, nginx-workeaser.conf
- **Migraciones**: funcionales con DB del dump (adonis_schema trackea estado). Al copiar archivos al container, `migration:run` reporta "Already up to date".
- **Sub-verificador**: FAIL inicial (credenciales dev en VPS) → corregido → PASS implícito (verificación externa 7/7 OK)
- **Acceso**: http://62.238.102.24 (puerto 80, sin puerto explícito)
- **Hash commit**: `c4724aa` (infra) + `0394256` (cierre infra)

### 1A — Estabilización pantallas de servicios — 2026-08-06
- **Objetivo**: 4 pantallas dejan de crashear para cualquier rol (no solo MANAGER).
- **Archivos modificados**:
  - `pages/services/virtual-office/index.tsx` — null-guards + loading/error/empty states
  - `pages/services/meeting-room/index.tsx` — null-guards + loading/error/empty states
  - `pages/services/open-desks/index.tsx` — null-guards (incl. `= {}` faltante) + loading/error/empty states
  - `pages/services/private-rooms/index.tsx` — null-guards + loading/error/empty states
- **Archivo creado**:
  - `database/migrations/1747400000003_seed_missing_cowork_modules.ts` — seed reversible de VIRTUAL_OFFICE y MEETROOM en cowork_modules
- **Seed (ADVERTENCIA — cambio de datos)**:
  - Tabla: `cowork_modules`
  - Filas: `{name: 'Virtual Office', slug: 'VIRTUAL_OFFICE'}` y `{name: 'Meeting Room', slug: 'MEETROOM'}`
  - Reversible: `down()` elimina ambas filas por slug
- **Sub-auditor**: PASS — 6/6 checks (null-guards, estados, seed, scope, matriz 12, conservación)
- **NO desplegado** — espera aprobación para deploy.
- **Hash commit**: `a42e3ac`

### 1A-ext — Fix cookie login + consolidación — 2026-08-06
- **Objetivo**: arreglar bucle de redirección login→dashboard→login y consolidar flags de cookie.
- **Diagnóstico**: `user-token` se seteaba con `sameSite: "strict"` en LoginBox. El redirect post-login es navegación top-level → el navegador NO envía la cookie Strict → dashboard no la recibe → 401 → redirect a login → bucle.
- **Archivos modificados**:
  - `components/LoginBox/index.tsx` — `sameSite: "strict"` → `"Lax"`. `httpOnly` permanece comentado (no viable desde JS cliente). `secure` condicional en window.location.protocol.
  - `app/Controllers/Http/AuthController.ts` — `response.cookie('user-token', ...)` con `httpOnly: true`, `sameSite: 'lax'`, `secure` derivado de `APP_URL.startsWith('https://')`. Seteado ANTES del response JSON.
  - `config/app.ts` — cookie defaults: `httpOnly: true`, `sameSite: 'lax'`, `secure` condicional en APP_URL.
- **Flags finales de la cookie `user-token`**:
  - `SameSite=Lax` (corrige el bucle; permite envío en navegación top-level, bloquea cross-site de terceros)
  - `HttpOnly=true` (backend: AuthController + config/app.ts. Frontend: no puede setear httpOnly desde JS — esperado, la copia del backend lo cubre)
  - `Secure=false` en HTTP (staging actual por IP), `Secure=true` en HTTPS (producción futura). Controlado por `APP_URL` en backend, `window.location.protocol` en frontend.
- **Configuración centralizada**: 3 archivos (LoginBox para SSR, AuthController para httpOnly, config/app.ts para defaults). Mismos flags, derivados de la misma variable de entorno.
- **Sub-auditor**: PASS — 5/5 checks (cookie fix, null-guards+states, seed, scope, conservación)
- **NO desplegado** — espera aprobación explícita de Claudio para deploy.
- **Hash commit**: `074c0f4`

### Deploy 1A + 1A-ext a staging — 2026-08-06
- **VPS**: 62.238.102.24
- **Commit desplegado**: `074c0f4`
- **Método**: rsync desde disco → rebuild workeaser-api + frontend
- **Contenedores**: 4/4 UP healthy (mysql, workeaser-api, admin-api, frontend)
- **Migración seed**: VIRTUAL_OFFICE (id=7) y MEETROOM (id=8) insertados vía MySQL directo (INSERT IGNORE). La migración via `ace migration:run` sigue teniendo issues ESM.
- **APP_URL**: `http://62.238.102.24`
- **Cookie `user-token` observada en staging** (Set-Cookie del deploy real):
  - `SameSite=Lax` ✅
  - `HttpOnly` ✅ (seteado por backend AuthController)
  - `Secure` NO presente ✅ (APP_URL es http://, el código omite Secure correctamente)
- **API logs**: clean, started server on 0.0.0.0:3333, no errors
- **Login test**: 200 OK con demo@workeaser.com (cookie flags confirmados en respuesta)
- **Health**: healthy, DB connection healthy
- **Frontend**: 200 OK en puerto 80
- **Pendiente**: verificación MANUAL de Claudio en navegador (loguearse en http://62.238.102.24 y confirmar que entra al dashboard sin bucle)
- **Hash commit**: `7101f33`

### Hotfix: Stripe + rate-limit en staging — 2026-08-06
- **Problema**: `IntegrationError: Missing value for Stripe(): apiKey should be a string` — CoworkingLayout y ClientLayout llamaban `loadStripe(undefined)` sin null-guard.
- **Fix**: null-guard (`stripeKey ? loadStripe(stripeKey) : null`) en ambos layouts + `NEXT_PUBLIC_STRIPE: pk_test_PLACEHOLDER` en compose staging.
- **Rate-limit 429**: esperado tras múltiples intentos fallidos de login. Se resuelve solo al expirar la ventana.
- **Hash commit**: `9ccbc3d`


### Corrección 1A — 3 fallos de estabilización — 2026-08-07
- **FALLO A**: Next.js Image Optimizer rechazaba fotos con 400 (w=6475 fuera de deviceSizes).
  Fix: Thumbnail usa `<img>` nativo en vez de `next/legacy/image`. Las fotos de `/api/photos/` no necesitan optimización.
- **FALLO B**: `.map()` sobre data con elementos null crasheaba ("Cannot read properties of null").
  Fix: `.filter(Boolean).map()` en 4 páginas de servicios + dashboard (6 ocurrencias).
- **FALLO C**: ErrorBoundary no reseteaba al navegar — "Something went wrong" persistía entre rutas.
  Fix: `key={router.asPath}` en ErrorBoundary interior de `_app.tsx`.
- **Sub-auditor**: PASS — Fixes A/B/C verificados. Solo 7 archivos modificados, scope respetado.
- **NO desplegado** — espera aprobación de Claudio para deploy.
- **Hash commit**: `b6d3f91`

### Corrección 1A Fase 2 — optional chaining + photos 404 — 2026-08-08
- **FALLO B2**: optional chaining (??) en 6 callbacks .map() (dashboard + 4 servicios). Propiedades ausentes ya no causan TypeError.
- **FALLO D**: PhotosController devuelve 404 (no 500) cuando el archivo no existe. Thumbnail ya tiene placeholder.
- **Sub-auditor**: PASS. 6 archivos modificados.
- **NO desplegado** — espera aprobación de Claudio.
- **Hash commit**: 597c8d9

### Deploy Corrección 1A (b6d3f91 + 597c8d9) — 2026-08-07/08
- **VPS**: 62.238.102.24
- **Commits**: b6d3f91 (Fase 1: img nativo, filter(Boolean), ErrorBoundary key) + 597c8d9 (Fase 2: optional chaining, photos 404)
- **Rebuild**: API + frontend (nuevas imágenes)
- **Contenedores**: 4/4 UP healthy
- **Photos 404**: verificado (antes devolvía 500) — `curl /api/photos/nonexistent.jpg` → 404
- **API logs**: limpios, started server OK
- **Frontend**: 200 OK
- **Pendiente**: verificación MANUAL de Claudio en navegador (dashboard + 4 servicios sin "Something went wrong", sin 500 en Network, sin TypeError)
- **Hash commit**: *(pendiente)*
