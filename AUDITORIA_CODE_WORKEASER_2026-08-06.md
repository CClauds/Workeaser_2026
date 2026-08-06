# AUDITORIA_CODE_WORKEASER — 2026-08-06

> **Modo:** 100% LECTURA. Ningún archivo, configuración, base de datos o código fue modificado.
> **Base:** snapshot `workeaser-full-2026-08-06_14-18-20` copiado a `workeaser-2026`.
> **Auditoría previa:** `workeaser-auditoria/` (25 docs, 06/08/2026) — verificada y corregida contra código real.
> **Evidencias:** [CODIGO] = confirmado en archivo fuente · [CONFIG] = confirmado en configuración/env · [BANCO] = confirmado en SQL dump · [RUNTIME] = confirmado en ejecución (MANIFESTO.txt, docker logs) · [AUDIT_PREV] = coincide con auditoría previa.

---

## A. PANTALLAS ROTAS — Meeting Room, Open Desk, Private Room

### A.1 Hallazgo principal

**Tres bugs de código determinísticos** causan crashes con React ErrorBoundary cuando `useFetch` retorna `data === undefined` (lo cual ocurre ante cualquier error de backend: 403, 500, timeout de red, etc.).

| Pantalla | Estado | Causa raíz |
|----------|--------|------------|
| Open Desk | ❌ ROTO | `TypeError: Cannot destructure property 'result' of undefined` — falta `= {}` en destructure (render) |
| Meeting Room | ❌ ROTO | `TypeError: Cannot read properties of undefined (reading 'slice')` — sin null-guard en useEffect |
| Private Room | ❌ ROTO | Idéntico a Meeting Room: `rooms.slice(0, 5)` revienta cuando `data === undefined` |
| Virtual Office | ⚠️ MISMO BUG | Tiene el mismo patrón frágil (`virtualOffices.slice(0, 5)` en línea 108 sin guard). |

**Nota importante sobre Virtual Office:** La auditoría previa reporta que Virtual Office SÍ renderiza. Esto es posible si el usuario logueado es MANAGER (bypass del middleware `CoworkAuthorization.ts:30-32`), en cuyo caso los 4 endpoints responden exitosamente. Las 4 páginas tienen bugs idénticos — la diferencia es solo qué endpoint falla en el entorno live. **No se puede determinar el rol exacto del usuario desde el snapshot.** Para un usuario EMPLOYEE, las 4 fallarían (incluyendo Virtual Office) porque ni `VIRTUAL_OFFICE` ni `MEETROOM` existen en `cowork_modules`. Para MANAGER, las 4 responderían. La tabla `rooms` vacía NO causa `data === undefined` (`ResponseApi.ts` retorna `result: []` con HTTP 200, y `.slice(0,5)` sobre array vacío no revienta).

### A.2 Evidencias (archivo:línea)

**Open Desk — bug de código determinístico (crash en render):**
- `src/workeaser-frontend/.../pages/services/open-desks/index.tsx:82-84` [CODIGO]
  ```js
  const { data: { result: desks, pagination }, mutate } = useFetch<OpenDesksResponse>(...)
  ```
  Es la ÚNICA de las 4 páginas sin `= {}` como default del destructure. Las otras tres sí lo tienen (virtual-office:85, meeting-room:84, private-rooms:84). Cuando `data` es `undefined` (error de red/autorización), esto lanza `TypeError` durante el render → ErrorBoundary.

**Meeting Room — crash en efecto (mount):**
- `src/workeaser-frontend/.../pages/services/meeting-room/index.tsx:107` [CODIGO]
  ```js
  if (hasMounted.current) { setData(meetingRooms.slice(0, 5)); }
  ```
  `meetingRooms` es `undefined` cuando `useFetch` retorna `data === undefined`.

**Private Room — idéntico:**
- `src/workeaser-frontend/.../pages/services/private-rooms/index.tsx:106` [CODIGO]
  ```js
  if (hasMounted.current) { setData(rooms.slice(0, 5)); }
  ```

**Virtual Office — mismo bug latente:**
- `src/workeaser-frontend/.../pages/services/virtual-office/index.tsx:108` [CODIGO]
  ```js
  if (hasMounted.current) { setData(virtualOffices.slice(0, 5)); }
  ```
  También carece de null-guard; solo no ha crasheado porque su endpoint respondió exitosamente en el entorno live.

**ErrorBoundary que atrapa los crashes:**
- `src/workeaser-frontend/.../components/ErrorBoundary/index.tsx` — renderiza "Something went wrong" [CODIGO]
- Montado DOS VECES en `_app.tsx:61-70` [CODIGO]

**useFetch no lanza en error:**
- `src/workeaser-frontend/.../hooks/useFetch.tsx:41` — SWR wrapper; `data` queda `undefined` en error, no throw [CODIGO]
- Solo redirige a `/login` si es 401 (líneas 58-65) [CODIGO]

### A.3 Análisis de los endpoints backend

**Middleware de autorización:**
- `CoworkAuthorization.ts:30-32` — MANAGER bypass total (no verifica módulos) [CODIGO]
- `CoworkAuthorizationService.ts:12-35` — para EMPLOYEE, busca `CoworkModule` por slug; si no existe → `modulesId = []` → 403 [CODIGO]
- `cowork_modules` en DB solo tiene 6 slugs: LOCATIONS, SERVICES, RELATIONSHIP, FINANCES, REPORTS, ACCOUNT_SETTINGS [BANCO — workeaser-db.sql:838]
- **Ni `VIRTUAL_OFFICE` ni `MEETROOM` existen en `cowork_modules`** — para EMPLOYEE, ambos dan 403
- Desks y Rooms usan slug `LOCATIONS` → acceso depende de si el EMPLOYEE tiene ese módulo asignado

**Endpoints por página:**
| Página | Endpoint | Middleware | Módulo requerido |
|--------|----------|------------|-----------------|
| Virtual Office | `/api/cowork/virtualoffices` | `coworkAuthorization:VIRTUAL_OFFICE` | VIRTUAL_OFFICE (NO existe en DB) |
| Meeting Room | `/api/cowork/meetrooms` | `coworkAuthorization:MEETROOM` | MEETROOM (NO existe en DB) |
| Open Desk | `/api/cowork/desks` | `coworkAuthorization:LOCATIONS` | LOCATIONS (existe) |
| Private Room | `/api/cowork/rooms` | `coworkAuthorization:LOCATIONS` | LOCATIONS (existe) |

**Comportamiento con tabla vacía:** `ResponseApi.ts` — `responseWithPagination` siempre retorna `result: result.data || []` con HTTP 200. Una tabla vacía produce `data.result = []`, que es definido. `.slice(0,5)` sobre `[]` NO revienta. El crash requiere `data === undefined` (error HTTP o de red).

### A.4 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| Open Desk sin `= {}` en destructure de useFetch | ROTO | open-desks/index.tsx:82-84 |
| Meeting Room sin null-guard en useEffect (line 107) | ROTO | meeting-room/index.tsx:107 |
| Private Room sin null-guard en useEffect (line 106) | ROTO | private-rooms/index.tsx:106 |
| Virtual Office tiene el MISMO bug sin null-guard (line 108) | ROTO | virtual-office/index.tsx:108 |
| Ninguna de las 4 páginas tiene estado de loading/error | A CONSTRUIR | Las 4 páginas ignoran `isLoading`/`error` de useFetch |
| Cowork_modules no tiene slugs VIRTUAL_OFFICE ni MEETROOM | ROTO | workeaser-db.sql:838 |
| MANAGER bypass el check → 4 endpoints responden; EMPLOYEE → 4 fallan | EXISTE | CoworkAuthorization.ts:30-32 |
| Disparador exacto en live NO determinable desde snapshot (depende del rol) | PENDIENTE | Requiere verificar rol del usuario que vio los crashes |

---

## B. PAGOS — Stripe, Plaid, Portal de Pagos

### B.1 Stripe

**StripeImplementation.ts** — código completo (385 líneas), funcional, pero en modo TEST con credenciales placeholder [CODIGO].

| Archivo | Líneas | Contenido |
|---------|--------|-----------|
| `app/Integrations/Payments/Implementation/StripeImplementation.ts` | 385 | Clase completa: customers, cards, bank_accounts, charges, refunds, Stripe Connect |
| `app/Integrations/Payments/Payments.interface.ts` | 125 | Interfaz PaymentsInterface |

**Métodos implementados:** `createCustomer`, `listCards`, `getCard`, `createCard`, `updateCard`, `deleteCard`, `listBankAccounts`, `createBankAccount`, `deleteBankAccount`, `getBankAccount`, `updateBankAccount`, `createCharge` (Stripe Connect con `application_fee_amount`), `createPublicCharge`, `getCharge`, `refund`, `createAccount`, `getOnboardingUrl`, `createExternalAccount`, `changeDefaultExternalAccount`, `deleteExternalAccount`.

**Gaps detectados:**
- NO existe método `capture()` — usa la API legacy de Charges con `source` tokens, no PaymentIntents [CODIGO]
- API version `2020-08-27` (obsoleta) [CODIGO — StripeImplementation.ts:28]

**Credenciales:**
- `STRIPE_SECRET_KEY=sk_test_localdev` — placeholder, ni siquiera formato válido de test key [CONFIG — env-pc/workeaser-api.env:36]
- `STRIPE_WEBHOOK_SECRET_KEY=whsec_localdev` — placeholder [CONFIG — env-pc/workeaser-api.env:37]
- Frontend `NEXT_PUBLIC_STRIPE=` vacío en `.env.local.example` [CONFIG]

### B.2 Stripe Webhook

**POST /api/webhooks/stripe** — completamente implementado con anti-replay + DLQ [CODIGO].
- `app/Controllers/Http/Webhooks/StripeController.ts` (377 líneas) [CODIGO]
- Validación: `stripe.webhooks.constructEvent` + timestamp-skew + nonce anti-replay (líneas 51-68) [CODIGO]
- Eventos manejados: `account`, `charge.succeeded`, `charge.refunded`, `account.external_account.created`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`, `checkout.session.completed`
- Fallos → `WebhookRetryQueueService` (DLQ) → pero el scheduler no la procesa (ver Módulo G)

### B.3 CardElement y Portal de Pagos

**CardElement usado en 6 lugares, NO existe un "portal de pagos" unificado** [CODIGO]:
1. `pages/invoice-payment/[id].tsx:220` — pago público de factura
2. `components/FormBlocks/PaymentFormBlock/index.tsx:116` — tabs CARD/BANK_ACCOUNT
3. `components/Modals/PaymentModal/index.tsx:296` — captura/reembolso (cowork)
4. `pages/settings/wallet/add/index.tsx:147` — wallet cowork
5. `pages/client/settings/wallet/add/index.tsx:143` — wallet cliente
6. `components/StripeCardForm/index.tsx:61` — formulario reusable (subscriptions)

### B.4 /invoice-payment/[id] — flujo de pago público

SÍ es un flujo completo de pago público (646 líneas) [CODIGO]:
- Tabla de items con montos editables (`EditableCell`)
- Selección de método: "Credit/Debit Card" | "Bank Account" (2 tabs)
- CardElement para tarjeta + Plaid Link para banco
- POST a `/api/invoice/:id`

**Pero solo 2 métodos** — NO existe Zelle, NO existe cheque como método separado. Solo CARD y BANK_ACCOUNT. El método manual es indirecto: el coworking usa RECEIVE_PAYMENT en el PaymentModal para registrar pagos externos (cash, Zelle, cheque) después de recibirlos [CODIGO].

`PaymentTypesEnum` = `CARD | BANK_ACCOUNT | RECEIVED` [CODIGO — Contracts/enums.ts:224-228]

### B.5 Plaid

**PlaidImplementation.ts** — 185 líneas, código funcional, credenciales placeholder [CODIGO].
- `app/Integrations/BankReconciliation/Implementation/PlaidImplementation.ts` [CODIGO]
- Métodos: `createLinkToken`, `exchangePublicTokenToAccessToken`, `invalidateAccessToken`, `createStripeToken` (Stripe ACH), `getAccountInfo`, `getBankInfo`, `syncTransactions`
- `PLAID_CLIENT_ID=placeholder`, `PLAID_SECRET_KEY=placeholder` [CONFIG — env-pc/workeaser-api.env:38-39]
- Task `PlaidReconciliation` existe pero no corre (ver Módulo G)

### B.6 Tablas de base de datos

TODAS VACÍAS [BANCO]:
- `payments` (0), `payment_histories` (0), `invoice_payment_histories` (0)
- `invoices` (1 fila huérfana, amount=80000, sin items), `invoice_items` (0)
- `cards` (0), `bank_accounts` (0), `linked_bank_accounts` (0)
- `subscriptions` (1 fila demo: `sub_DEMO_FAKE_ID`/`cus_DEMO_FAKE_ID`, status trialing), `subscription_plans` (3: Solo, Growth, Network)

### B.7 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| StripeImplementation completo pero en TEST con placeholder keys | EXISTE | StripeImplementation.ts:385, env |
| CardElement en 6 lugares, sin portal unificado | EXISTE | 6 archivos listados arriba |
| /invoice-payment/[id] público funcional | EXISTE | invoice-payment/[id].tsx:646 |
| Solo 2 métodos de pago (Card + Bank) — falta Zelle/cheque explícito | A CONSTRUIR | PaymentFormBlock, PaymentTypesEnum |
| NO PaymentIntents (usa Charges API legacy) | ROTO | StripeImplementation.ts |
| Plaid código completo, credenciales placeholder | EXISTE | PlaidImplementation.ts |
| 0 pagos reales, 0 facturas, 0 tarjetas | VACÍO | workeaser-db.sql |
| DLQ de webhooks Stripe implementada pero no procesada (scheduler off) | ROTO | WebhookRetryQueueService + Módulo G |

---

## C. FIRMA / CONTRATOS — BoldSign, DocuSign, AdobeSign

### C.1 BoldSign — cableado al flujo real pero ROTO en runtime

**Es el ÚNICO proveedor de firma electrónica conectado al flujo de contratos.** Pero no funciona.

| Archivo | Líneas | Rol |
|---------|--------|-----|
| `app/Integrations/BoldSign/implemetation/BoldSign.impl.ts` | 250 | Clase BoldSign: SendDocument, getEmbeddedSignLink, getDocumentPDF, identidades |
| `app/Integrations/BoldSign/implemetation/BoldSign.api.ts` | 12 | axios con `baseURL: Env.get('BOLD_SIGN_API')` ← **fuente del bug: si env vacío → "Invalid URL"** |
| `app/Middleware/BoldSignValidation.ts` | 32 | HMAC middleware para webhook |
| `app/Controllers/Http/Cowork/BoldSignsController.ts` | 60 | GetIdentity, CreateIdentity, ResendIdentity |
| `app/Controllers/Http/Webhooks/BoldSignController.ts` | 13 | Webhook → ContractService.contractEnvelopeUpdate |
| `app/Services/Cowork/ContractService.ts` | 1302 | El hub. sendContract (794-837), getContractStatus (1154-1190), contractEnvelopeUpdate (1078-1107) |

**Bug raíz:** `BOLD_SIGN_API` está vacío en todos los archivos de entorno (ni siquiera aparece en `env-pc/workeaser-api.env`). `BoldSign.api.ts` usa `Env.get('BOLD_SIGN_API')` como baseURL de axios → `TypeError: Invalid URL` [RUNTIME — docker logs 23/07].

### C.2 DocuSign — SHELL, NUNCA CONECTADO

| Archivo | Líneas | Rol |
|---------|--------|-----|
| `app/Integrations/ESignature/Implementation/DocusignImplementation.ts` | 159 | Clase completa: sendEnvelope, makeEnvelope, getEnvelopePdf, JWT authenticate |
| `providers/AppProvider.ts:14-25` | — | Bindeo IoC singleton → **CERO consumers** |
| `app/Controllers/Http/Webhooks/DocusignController.ts` | 17 | Retorna `"ADOBESIGN IS DISABLED"`; lógica comentada. NOTA: la clase dentro del archivo se llama `AdobeSignController` (nombres invertidos entre archivos) |
| `start/routes/webhooks/docusign.ts` | 5 | Ruta POST registrada |

**Dependencias npm removibles:** `docusign-esign ^5.14.0`, `@types/docusign-esign ^5.19.1` [CONFIG — package.json:84,90]

### C.3 AdobeSign — DESACTIVADO EXPLÍCITAMENTE

| Archivo | Líneas | Rol |
|---------|--------|-----|
| `app/Integrations/AdobeSign/Implementation/AdobeSignImplementation.ts` | 82 | SendContract, getDocumentPdf |
| `app/Controllers/Http/Webhooks/AdobeSignController.ts` | 41 | Clase `DocusignController` (nombre incorrecto en archivo AdobeSign); `store()` con lógica comentada |
| `app/Services/Cowork/ContractService.ts:1154-1190` | — | `ContractStatus()` usa AdobeSignApi con envelopeId de BoldSign — **bug cross-vendor** |

### C.4 Contratos — código completo, 0 datos

**Controller y rutas:**
- `app/Controllers/Http/Cowork/ContractsController.ts` (205 líneas): CRUD completo + sendContract + getContractPdf + contractUrlCowork [CODIGO]
- `app/Controllers/Http/Client/ContractController.ts` (13 líneas): contractUrlClient [CODIGO]
- 12 rutas cowork bajo `/api/cowork/relationship/contracts` [CODIGO — start/routes/cowork/contracts.ts]
- 1 ruta cliente: `GET /api/client/contracts/:id/url` [CODIGO — start/routes/client/contract.ts]

**Tablas (todas vacías):** `contracts` (0), `contract_activities` (0), `contract_documents` (0), `contract_notifications` (0), `contract_renewals` (0) [BANCO]

### C.5 ¿Qué se REMUEVE al migrar a Verdocs?

**API — eliminar completamente:**
- `app/Integrations/BoldSign/` (4 archivos)
- `app/Integrations/AdobeSign/` (3 archivos)
- `app/Integrations/ESignature/` (3 archivos)
- `app/Middleware/BoldSignValidation.ts`
- `app/Utils/BoldSign.ts`
- `app/Controllers/Http/Webhooks/BoldSignController.ts`, `DocusignController.ts`, `AdobeSignController.ts`
- `app/Controllers/Http/Cowork/BoldSignsController.ts`
- `app/Services/Cowork/BoldSignService.ts`
- `start/routes/webhooks/boldsign.ts`, `docusign.ts`, `adobesign.ts`
- `start/routes/cowork/boldsign.ts`
- `start/kernel.ts:51` (registro de middleware `boldsignValidation`)
- `start/routes.ts:40,87-89` (imports de rutas)
- `providers/AppProvider.ts:14-25` + `app/Integrations/ESignature/ESignature.d.ts`
- `docusign-esign` y `@types/docusign-esign` de package.json

**API — reescribir (reemplazar llamadas BoldSign → Verdocs):**
- `app/Services/Cowork/ContractService.ts` — líneas 794-837 (sendContract), 839-856 (getContractPdf), 1109-1152 (getContractUrl), 1078-1107 (contractEnvelopeUpdate), 1154-1190 (ContractStatus)
- `app/Services/Client/ContractService.ts` — completamente BoldSign

**Frontend — eliminar/reescribir:**
- `src/features/GlobalSettings/ExternalServices/index.tsx` — tarjeta de BoldSign settings
- `src/components/Modals/AttachContract/index.tsx` — FetchBoldSignIdentity (224-230), gate de envío (657-661, 1371-1377)
- `src/components/Modals/EmbbedSignModal/index.tsx` — iframe de DocuSign
- `public/boldsign_logo.png`
- Textos "DocuSign" en `pages/index.tsx:27,60`, `terms.tsx:101`, `privacy.tsx:157`

**Env vars a eliminar:** `BOLD_SIGN_*`, `DOCUSIGN_*`, `AUTHORIZATION_ADOBE_SIGN`, `ADOBE_SIGN_API`, `CLIENTID_ADOBE_SIGN`

### C.6 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| BoldSign cableado al flujo real de contratos | EXISTE | ContractService.ts, BoldSign.impl.ts |
| BoldSign roto en runtime (Invalid URL, sin credenciales) | ROTO | BoldSign.api.ts:12, env vacío, docker logs |
| DocuSign implementado pero NUNCA conectado (0 consumers) | EXISTE | DocusignImplementation.ts, AppProvider.ts |
| AdobeSign explícitamente desactivado | EXISTE | AdobeSignController.ts:17 |
| ContractService usa AdobeSignApi con envelopeId de BoldSign | ROTO | ContractService.ts:1154-1190 |
| 0 contratos en base de datos | VACÍO | workeaser-db.sql |
| 3 proveedores de firma para remover → 1 (Verdocs) | A CONSTRUIR | — |

---

## D. CHAT — Omnichat / MessagesPopup

### D.1 Estado actual

**Omnichat NO es código muerto** — es el sistema de mensajería cliente-operador con historial persistente, modelo CCBA.

### D.2 Frontend

| Archivo | Descripción |
|---------|-------------|
| `pages/relationship/omnichat/index.tsx` | Chat UI completo: lista de conversaciones (ChatCard), burbujas (ChatBalloon), caja de texto (ChatTextBox), panel lateral (ChatInfo) |
| `components/Chat/*` | 6 sub-componentes: ChatCard, ChatBalloon, ChatTextBox, ChatInfo, ChatAvatar, ChatButton |
| `components/MessagesPopup/index.tsx` | Popup "Last Messages" en header, polling único sin intervalo |

**Sidebar — comentado:** `src/components/Sidebar/index.tsx:192-196` — el link a Omnichat está comentado (`{/* ... */}`). Pero es accesible desde:
- `pages/relationship/agenda/index.tsx:201`
- `pages/relationship/deals-and-opportunities/index.tsx:141`
- `pages/relationship/client-management/index.tsx:142`

**MessagesPopup** usado en:
- `components/Header/index.tsx:128` (header cowork)
- `components/Client/Header/index.tsx:96` (header cliente)

### D.3 Backend (API)

**Rutas cowork** (`start/routes/cowork/chats.ts`, auth + coworkAuthorization:RELATIONSHIP):
| Método | Ruta | Controller |
|--------|------|------------|
| GET | `/api/cowork/chats` | ChatController.index |
| POST | `/api/cowork/chats` | ChatController.firstOrCreateChat |
| GET | `/api/cowork/chats/lastmessages` | ChatController.lastMessages |
| GET | `/api/cowork/chats/:uuid/messages` | ChatController.showChatMessages |
| POST | `/api/cowork/chats/:uuid/messages` | ChatController.newMessage |

**Rutas cliente** (`start/routes/client/chats.ts`): idénticas 5 rutas → `Client/ChatController`.

**Servicios:** `app/Services/Cowork/ChatService.ts`, `app/Services/Client/ChatService.ts`
**Modelos:** `app/Models/Chat.ts`, `app/Models/ChatMessage.ts`, `app/Models/WhatsappMessage.ts`

### D.4 Persistencia en DB

**SÍ, el historial persiste en DB.** `ChatService.newMessage` hace `ChatMessage.create()` dentro de `Database.transaction()`. `showChatMessages` recarga historial completo con `preload('messages')`. Frontend hace polling cada 3 segundos (`omnichat/index.tsx:91` — `useIntervalAsync(getChatMessanges, 3000)`).

**Pero 0 datos:** tablas `chats` (0), `chat_messages` (0) [BANCO].

### D.5 WhatsApp (separado, NO conectado a Omnichat)

- `start/routes/webhooks/whatsapp.ts` — GET (verify challenge) + POST (status + inbound)
- `app/Controllers/Http/Webhooks/WhatsappController.ts` + `WhatsappService`
- `app/Tasks/ProcessWhatsappQueue.ts` — no corre (ver Módulo G)
- Mensajes inbound de WhatsApp se guardan SOLO en `whatsapp_messages` — NO hay puente a `chat_messages`. La UI de Omnichat nunca muestra tráfico de WhatsApp.

### D.6 Sin WebSocket/tiempo real

Polling HTTP cada 3 segundos simula "tiempo real". No hay WebSocket, Socket.io, Pusher, ni Adonis Ws.

### D.7 Gaps

- `is_read` nunca se actualiza — no hay endpoint de mark-as-read
- Tablas `message_attachments`/`message_photos`/`message_videos` existen pero ningún código las usa
- Botones de media/translate en ChatTextBox comentados

### D.8 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| Omnichat es chat funcional con historial persistente | EXISTE | ChatController, ChatService, ChatMessage.create |
| Link en sidebar COMENTADO (feature semi-oculto) | EXISTE | Sidebar/index.tsx:192-196 |
| MessagesPopup funcional en headers | EXISTE | MessagesPopup, Header/index.tsx |
| 0 mensajes en DB | VACÍO | workeaser-db.sql |
| Sin WebSocket — polling 3s | EXISTE | omnichat/index.tsx:91 |
| WhatsApp NO conectado al chat interno | A CONSTRUIR | WhatsappService vs ChatService |
| Sin mark-as-read | A CONSTRUIR | ChatMessage model (is_read siempre 0) |

---

## E. DOCUMENTOS — S3/Drive, uploads, tablas

### E.1 Sistema actual

**AdonisJS Drive, disco LOCAL** (NO S3, NO Google Drive).

- `DRIVE_DISK=local` [CONFIG — env-pc/workeaser-api.env:6]
- `config/drive.ts:43-81` — disco local: `tmpPath('uploads')`, `serveFiles: true`, basePath `/uploads` [CODIGO]
- `config/drive.ts:96-103` — S3 configurado pero sin credenciales reales (placeholder) [CODIGO]
- Paquete `@adonisjs/drive-s3` instalado pero nunca usado [CONFIG — package.json:77]

### E.2 Google Drive — NO EXISTE

Cero integración. Búsqueda exhaustiva: solo aparece en `CONTEXTO_WORKEASER.md` como plan futuro. La única integración Google existente es Calendar (`googleapis` para Calendar API, scopes OAuth solo `calendar` y `userinfo.email`). No hay Drive API client, ni OAuth scopes de Drive, ni credenciales de Drive.

### E.3 API de documentos

**Rutas** (`start/routes/documents.ts`, `photos.ts`, `videos.ts`):

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/documents/*` | PÚBLICO (sin auth) |
| POST | `/api/documents` | auth requerido |
| DELETE | `/api/documents/*` | auth requerido |
| GET | `/api/photos/*` | PÚBLICO |
| POST | `/api/photos` | silentAuth |
| DELETE | `/api/photos/*` | auth |
| GET | `/api/videos/*` | PÚBLICO |
| POST | `/api/videos` | silentAuth |
| DELETE | `/api/videos/*` | auth |

**Validación server-side:**
- Documentos: 2MB, ext `pdf, jpg, png, gif` [CODIGO — DocumentsController.ts:44-47]
- Fotos: 4MB, ext `jpg, png, gif` [CODIGO — PhotosController.ts:42-45]
- Videos: 20MB, ext `mp4, avi, mov` [CODIGO — VideosController.ts:36-39]
- Sanitización de path: aplicada a documents y photos (`SafeFilename.ts`). VideosController NO sanitiza [CODIGO].

### E.4 Tablas

| Tabla | Filas | Estado |
|-------|-------|--------|
| `documents` | 0 | VACÍA |
| `photos` | 31 | user_id=194 (dev data) |
| `videos` | 0 | VACÍA |
| `contract_documents` | 0 | VACÍA |
| `message_attachments`/`message_photos`/`message_videos` | 0 | VACÍAS — schema huérfano |

### E.5 Frontend

No existe página independiente de "Documentos". Todo el UI de documentos es dentro del flujo de contratos:
- `components/Modals/AttachContract/index.tsx` — Dropzone + FileInput en creación de contrato
- `components/Modals/DocumentsModal/index.tsx` — visor de documentos del contrato
- `services/api/fileUpload/index.ts` — `uploadImage`/`uploadDocument`/`uploadFile` genérico

### E.6 Issues detectados

1. GET `/api/documents/*`, `/api/photos/*`, `/api/videos/*` son PÚBLICOS — cualquiera puede descargar archivos adivinando el UUID [CODIGO]
2. `DocumentsController.delete` loggea `'CREATE'` en vez de `'DELETE'` (copia-pega, línea 85) [CODIGO]
3. VideosController NO sanitiza paths (inconsistente con el fix Lote 5b) [CODIGO]
4. `contract.document_file[0].file` sin null-check → crash si contrato sin documentos [CODIGO — contracts/index.tsx:435]

### E.7 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| Drive local funcionando (fotos existen en disco) | EXISTE | uploads/uploads/photos/ 31 archivos |
| S3 configurado pero sin credenciales | EXISTE | config/drive.ts |
| Google Drive NO existe (solo plan en CONTEXTO) | A CONSTRUIR | CONTEXTO_WORKEASER.md |
| Tabla documents vacía | VACÍO | workeaser-db.sql |
| GET público de archivos (sin auth) | ROTO | DocumentsController, PhotosController |
| Sin UI de gestión documental independiente | A CONSTRUIR | Solo existe dentro de contratos |
| Videos sin sanitización de path | ROTO | VideosController.ts |

---

## F. PORTAL DEL CLIENTE — Rutas y profundidad

### F.1 /client — VACÍA

`src/workeaser-frontend/.../pages/client/index.tsx` — solo renderiza `<Head>My Membership | Workeaser</Head>`, sin contenido. Usa `NavbarLayout` (coworking shell, INCORRECTO). Nadie linkea a `/client`. [CODIGO]

### F.2 Mapa completo de rutas del cliente

**Shell cliente (ClientLayout = ClientHeader + contenido):**

| Ruta | Estado |
|------|--------|
| `/spaces` | ✅ Funcional — landing post-login |
| `/spaces/locations/[id]` | ✅ Funcional |
| `/spaces/services/[id]` | ✅ Funcional — reservar daypass/tour |
| `/client/membership` | ✅ Funcional — lista membresías |
| `/client/membership/[id]/products-and-services` | ✅ Funcional — incluye firma de contrato |
| `/client/membership/[id]/booking-schedule` | ✅ Funcional — bookings + cancel |
| `/client/membership/[id]/booking-schedule/[bookingId]` | ✅ Funcional |
| `/client/membership/[id]/mailbox-manager` | ✅ Funcional — buzón + forward |
| `/client/membership/[id]/mailbox-manager/[deliveryId]` | ✅ Funcional |
| `/client/membership/[id]/payment-and-invoices` | ✅ Funcional — facturas + pay |
| `/client/membership/[id]/payment-and-invoices/[invoiceId]` | ✅ Funcional |
| `/client/membership/[id]/benefits-overview` | 🔴 Placeholder — números hardcodeados, gráficos vacíos |
| `/client/settings/account-information` | ✅ Funcional |
| `/client/settings/subscriptions` | 🔴 Placeholder — "00", botones muertos |
| `/client/settings/wallet` | ✅ Funcional — wallet CRUD |
| `/client/settings/wallet/add` | ✅ Funcional — Stripe/Plaid |
| `/client/settings/payment` | 🔴 Placeholder — tabla vacía, sin fetch |
| `/client/settings/members` | ✅ Funcional |
| `/client/settings/members/add` | ✅ Funcional — invite |
| `/client/index.tsx` | 🔴 Página vacía |
| `/invoice-payment/[uuid]` | ✅ Funcional — público, sin login |

**Menú de navegación cliente:**
- **ClientHeader:** logo→`/spaces`, "My Membership"→`/client/membership`, chat popup, notificaciones, settings gear→`/client/settings/account-information`
- **MemberSidebar:** 4 items — Products & Services, Booking Schedule, Mailbox Manager, Payment & Invoices
- **ClientSettingsHeader:** 5 tabs — Account, Subscriptions, Wallet, Payment History, Team

### F.3 Profundidad de clics

**PAGAR (login → portal de pago): 4 clics / 5 páginas**
1. Login → auto-redirect `/spaces`
2. "My Membership" → `/client/membership`
3. Click card → `/client/membership/[id]/products-and-services`
4. Sidebar "Payment & Invoices" → `payment-and-invoices`
5. ⋮ → "PAY INVOICE" → `/invoice-payment/[uuid]` → formulario Stripe

Atajo: link compartible de factura (público, 1 clic desde email).

**FIRMAR (login → firma de contrato): 3 clics**
1. Login → `/spaces`
2. "My Membership" → `/client/membership`
3. Click card → products-and-services → ⋮ → "SIGN CONTRACT" → modal EmbbedSignModal (0 clics adicionales)

### F.4 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| /client vacía, sin contenido, usa layout incorrecto | VACÍO | client/index.tsx |
| Portal cliente funcional con ~15 rutas activas | EXISTE | 15 páginas listadas arriba |
| Pago: 4 clics (o 1 con link directo) | EXISTE | payment-and-invoices → invoice-payment |
| Firma: 3 clics | EXISTE | products-and-services → EmbbedSignModal |
| 3 páginas placeholder (benefits, subscriptions, payment) | A CONSTRUIR | Listadas arriba |
| Dashboard de cliente NO existe (redirect a /spaces) | A CONSTRUIR | AuthContext.tsx:54 |

---

## G. SCHEDULER — Tasks y estado runtime

### G.1 Veredicto: NO CORRE

El container `workeaser-api` ejecuta solo `node server.js`. `node ace scheduler:run` nunca se inicia. Confirmado por:
- `/proc/1/cmdline` = `tini -- node server.js` (sin scheduler) [RUNTIME — auditoría previa]
- `docker logs` grep scheduler → 0 ocurrencias [RUNTIME — docs-analise/06]
- Dockerfile: `CMD ["node","server.js"]` [CODIGO — config/Dockerfile.workeaser-api:42]
- docker-compose.yml: sin servicio scheduler separado; el servicio `workeaser-api` tiene `command: dumb-init node ace serve --watch...` (sin scheduler:run) [CONFIG]
- package.json scripts: sin script de scheduler [CONFIG]

### G.2 Las 8 tasks

Todas en `app/Tasks/` (provider `adonis5-scheduler ^2.0.2`):

| # | Task | Archivo | Cron | Función | Roda? |
|---|------|---------|------|---------|-------|
| 1 | RenewContractTask | `RenewContractTask.ts` | `0 1 * * *` | Renueva contratos (auto-renewal + readjustment) | ❌ |
| 2 | GenerateInvoice | `GenerateInvoice.ts` | `0 2 * * *` | Facturas recurrentes (código COMENTADO — no-op) | ❌ |
| 3 | ProcessDataDeletion | `ProcessDataDeletion.ts` | `0 3 * * *` | LGPD: borra data_deletion_requests vencidos | ❌ |
| 4 | OverdueInvoice | `OverdueInvoice.ts` | `0 5 * * * *` | Notifica facturas vencidas | ❌ |
| 5 | ProcessEmailQueue | `ProcessEmailQueue.ts` | `* * * * *` | Envía email_queue vía SES (cada min) | ❌ |
| 6 | ProcessWhatsappQueue | `ProcessWhatsappQueue.ts` | `* * * * *` | Envía WhatsApp (cada min) | ❌ |
| 7 | ProcessWebhookRetryQueue | `ProcessWebhookRetryQueue.ts` | `*/5 * * * *` | Retenta webhooks fallidos (cada 5 min) | ❌ |
| 8 | PlaidReconciliation | `PlaidReconciliation.ts` | `0 */2 * * *` | Match transacción→invoice (cada 2h) | ❌ |

**Notas:**
- Cada task tiene kill switch individual (`DISABLE_*` env var)
- 5 de 8 tienen `useLock=true` (evita ejecución duplicada)
- GenerateInvoice tiene su código real COMENTADO — es un no-op incluso si corriera [CODIGO — GenerateInvoice.ts]
- Cron de OverdueInvoice tiene 6 campos (¿bug de formato?) vs 5 en las demás

### G.3 Tablas de colas (todas vacías)

`email_queue` (0), `whatsapp_messages` (0), `webhook_dead_letter_queue` (0), `data_deletion_requests` (0) [BANCO]

### G.4 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| 8 tasks definidas con código y cron | EXISTE | app/Tasks/*.ts |
| Scheduler NO CORRE (node server.js sin scheduler:run) | ROTO | MANIFESTO, Dockerfile, /proc |
| GenerateInvoice es no-op (código comentado) | ROTO | GenerateInvoice.ts |
| 0 datos en colas (nunca han corrido) | VACÍO | workeaser-db.sql |
| Sin servicio de scheduler en compose | A CONSTRUIR | docker-compose.yml |

---

## H. CÓDIGO MUERTO — Qué se poda en el pivote B2C

### H.1 Módulos completos para eliminar

| Módulo | Archivos | ¿Por qué? | Safe delete? |
|--------|----------|-----------|--------------|
| **Marketplace** | `pages/marketplace/index.tsx`, `components/Headers/MarketplaceHeader/`, `components/Map/` | Pivote fuera de marketplace; 0 referencias inbound | ✅ Sí |
| **Membership viejo** | `pages/membership/` (15 archivos), `components/Menus/MemberSidebar/` | Datos hardcodeados ("string", "195 hours"), 0 API calls, 0 importers | ✅ Sí |
| **Community** | Solo links comentados en headers | Nunca existió | ✅ Sí |
| **NotificationBell** | `components/NotificationBell/` | DEPRECATED (HF-SPRINT-J-01), 0 importers | ✅ Sí |
| **Automations** | `pages/automations/index.tsx` | Placeholder "Em desenvolvimento", 0 inbound links | ✅ Sí |
| **Admin pages (frontend)** | `pages/admin/*` (audit-logs, discounts, metrics, webhook-dlq) | 0 nav links; llaman a workeaser-api, no admin-api | ⚠️ Confirmar |
| **Client index vacío** | `pages/client/index.tsx` | Vacío, layout incorrecto | ✅ Sí |
| **CRM/Sales (leads)** | `pages/relationship/lead-management/*`, `pages/relationship/deals-and-opportunities/*` | 0 datos, council dijo "fuera de scope" | ⚠️ Confirmar |
| **Admin-api entero** | `src/admin-api/admin-management-api-main/` | Huérfano — sin frontend consumer | ⚠️ Confirmar |

### H.2 Feature flags muertos

- `LEADS_FEATURE` — definido solo en `services/map/index.ts:35`, consumido en `QuickactionsMenu/index.tsx:23`. Nunca seteado → siempre false. [CODIGO]
- `getLeadFeatureFlagEnv()` — vive en el servicio de Mapbox sin razón [CODIGO]

### H.3 Integraciones para remover (reemplazadas en el pivote)

| Integración | Motivo |
|-------------|--------|
| BoldSign (completo) | → Verdocs |
| DocuSign (completo) | → Verdocs |
| AdobeSign (completo) | → Verdocs |
| Plaid | Sin credenciales reales, no requerido para B2C |
| Stripe Connect | Marketplace-era, no requerido para B2C directo |
| Google/Exchange Calendar | Placeholder, sin credenciales |

### H.4 Código comentado en masa (mayores bloques)

- `finances/invoices/[id]/index.tsx` — ~37 líneas comentadas
- `components/DotsMenu/ContractOptions` — 50 líneas
- `components/DotsMenu/LocationsOptions` — 54 líneas
- `components/SingleBooking/Meetroom` — ~182 líneas (bloque grande `{/* */}`)
- `components/FormBlocks/PricingForm` — 92 líneas
- Links Marketplace/Community/My Membership en ambos headers
- QuickactionsMenu: bookTour/newLead/ticket comentados

### H.5 Imports no usados (top offenders)

- `features/GlobalSettings/ExternalServices/index.tsx` — 5 imports muertos (Space, getAPIClient, useFetch, axios, mutate)
- `components/Chat/ChatInfo/index.tsx` — 10 imports muertos (chat side panel abandonado)
- `pages/client/settings/payment/index.tsx` — 9 imports muertos + tabla vacía hardcodeada
- `React` no usado en ~21 archivos

### H.6 Veredicto

| Hallazgo | Etiqueta | Evidencia |
|----------|----------|-----------|
| Marketplace: página + componentes huérfanos | CÓDIGO MUERTO | marketplace/index.tsx, 0 importers |
| Membership viejo: 15 archivos hardcodeados | CÓDIGO MUERTO | pages/membership/* |
| Omnichat NO es código muerto (es chat funcional) | EXISTE | Ver Módulo D |
| 3 proveedores de firma para remover | CÓDIGO MUERTO | Ver Módulo C |
| Admin-api huérfana | CÓDIGO MUERTO | src/admin-api/* |
| CRM leads/deals: 0 datos, fuera de scope B2C | CÓDIGO MUERTO | lead-management, deals-and-opportunities |
| Bloques comentados en ~15 archivos | CÓDIGO MUERTO | Listados en H.4 |

---

## TABLA RESUMEN POR MÓDULO

| Módulo | Qué se rescata | Qué se rehace | Qué se construye nuevo |
|--------|---------------|---------------|----------------------|
| **A. Pantallas** | Virtual Office page, CoworkingLayout, StyledTable | Las 4 páginas: guards + null-checks + loading/error/empty states (el bug está en las 4) | Estados de carga/vacío/error en las 4 páginas |
| **B. Pagos** | StripeImplementation, StripeController, /invoice-payment/[id], PaymentFormBlock, PaymentModal | Stripe: migrar de Charges API a PaymentIntents | Portal de pagos con 4 métodos (card, ACH, Zelle, cheque), facturación recurrente |
| **C. Firma** | ContractService (flujo de contratos), ContractsController, modelos Contract | ContractService.sendContract/getContractUrl → Verdocs API | Integración Verdocs completa (send, sign, webhook, status) |
| **D. Chat** | Omnichat UI, ChatController, ChatService, modelo CCBA con historial persistente | Des-comentar sidebar, activar para todos los clientes | Mark-as-read, adjuntos, integración WhatsApp↔chat |
| **E. Documentos** | Drive local, upload endpoints, SafeFilename | Reemplazar Drive local → Google Drive API | Gestión documental completa (Google Drive), UI independiente, permisos |
| **F. Portal** | 15 rutas cliente funcionales, membership, booking, mailbox, invoices | /client index, benefits, subscriptions, payment pages | Dashboard del cliente, portal de pagos client-facing |
| **G. Scheduler** | 8 tasks definidas, kill switches, useLock | Agregar `node ace scheduler:run` al compose | Monitoreo de tasks, idempotencia en todas |
| **H. Muerto** | Omnichat, /spaces, membresía cliente nueva | — | — |
| **H. Para podar** | — | — | Marketplace, membership viejo, 3 firmas, admin-api, CRM leads, Plaid, Stripe Connect, Calendar |

---

## ESTADO DE LA AUDITORÍA PREVIA

La auditoría previa (`workeaser-auditoria/`, 25 docs) es **sustancialmente correcta**. Los hallazgos de esta verificación:

- **Confirman:** scheduler no corre, Stripe en test, 81 tablas vacías, 0 invoices/payments/contracts, BoldSign quebrada, sin producción
- **Corrigen:** la causa raíz de las pantallas rotas (la auditoría previa no especificaba el bug exacto de código), el estado de DocuSign (no es "funcional", es un shell sin consumers), Omnichat no es código muerto
- **Amplían:** mapa exacto de rutas del cliente con profundidad de clics, checklist de archivos a eliminar para migración Verdocs, catálogo de código muerto con safe-delete

---


*Auditoría generada el 2026-08-06. Modo 100% lectura. Commit del snapshot: `88fba1a`.*
