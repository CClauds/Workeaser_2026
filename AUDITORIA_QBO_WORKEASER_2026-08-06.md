# AUDITORIA_QBO_WORKEASER — 2026-08-06

> **Modo:** 100% LECTURA. Ningún archivo, configuración, base de datos o código fue modificado.
> **Base:** snapshot `workeaser-full-2026-08-06_14-18-20` en `~/workeaser/workeaser-2026/`.
> **Evidencias:** [CODIGO] = archivo fuente · [BANCO] = SQL dump · [CONFIG] = configuración/env · [DOC] = documentación del proyecto · [SCRIPT] = script externo.

---

## 1. ¿Existe algún cliente/servicio de QBO API?

### NO. Cero código de integración QBO en todo el repositorio.

| Capa | Búsqueda | Resultado |
|------|----------|-----------|
| SDK npm | `node-quickbooks`, `intuit-oauth`, `@intuit/*`, `oauth2` | **NO ENCONTRADO** en ningún `package.json` de workeaser-api ni admin-api [CODIGO] |
| Cliente HTTP | `quickbooks.api.intuit.com`, `realmid`, `realm_id` | **NO ENCONTRADO** en ningún archivo `.ts`/`.tsx` del backend [CODIGO] |
| Servicio/Integración | `app/Integrations/` (contiene AdobeSign, BoldSign, ESignature, Payments, BankReconciliation, calendar, Whatsapp) | **No existe carpeta QBO/QuickBooks/Intuit** [CODIGO] |
| Controladores | `app/Controllers/Http/` en ambas APIs | **0 archivos** con referencias a QBO [CODIGO] |
| Rutas | `start/routes.ts` + sub-archivos `start/routes/` en ambas APIs | **0 rutas** QBO [CODIGO] |
| Middleware | `start/kernel.ts` en ambas APIs | **0 middleware** QBO [CODIGO] |
| Env vars | `env.ts`, `.env.example`, `config/env-pc/*.env` | **0 variables** QBO (no `QBO_*`, no `QUICKBOOKS_*`, no `INTUIT_*`) [CONFIG] |
| Kill switches | `app/Tasks/*.ts` (6 switches: DISABLE_WHATSAPP, WEBHOOK, PLAID, LGPD, EMAIL, INVOICE) | **0 switches** QBO [CODIGO] |
| Frontend | Todas las páginas, componentes, servicios | **0 referencias** QBO/QuickBooks/Intuit [CODIGO] |
| Docker | Dockerfiles, docker-compose.yml, compose.pc.yml | **0 variables** QBO [CONFIG] |

**Conclusión:** No existe absolutamente nada de integración con QuickBooks Online en el código de Workeaser. La carpeta `app/Integrations/` contiene 7 integraciones (Stripe, Plaid, WhatsApp, SES, BoldSign, DocuSign/AdobeSign, Google/Exchange Calendar) — QBO no es una de ellas.

---

## 2. Los 240 clientes importados de QBO: ¿cómo entraron?

### Entraron mediante un script Python puntual de una sola vez. NO hay código de import vivo.

**Script de importación:**
- **Archivo:** `credenciais/import-qbo-customers.py` (96 líneas) [SCRIPT]
- **Ubicación:** `~/workeaser/workeaser-2026/credenciais/import-qbo-customers.py`
- **Ejecutado:** manualmente en la máquina Windows local (`A:/Claude-Deep/config/ambiente/qb-oauth-tokens.json`)

**Cómo funciona el script:**

| Paso | Detalle | Evidencia |
|------|---------|-----------|
| 1. Autenticación | Lee `qb-oauth-tokens.json` desde `A:/Claude-Deep/config/ambiente/` | línea 4 [SCRIPT] |
| 2. Conexión QBO | `GET https://quickbooks.api.intuit.com/v3/company/{realmId}/query` con Bearer token | líneas 12-17 [SCRIPT] |
| 3. Realm ID | `123146338163304` (hardcodeado) | línea 5 [SCRIPT] |
| 4. Query | `SELECT * FROM Customer WHERE Active = true MAXRESULTS 1000` (SQL-style de QBO) | línea 13 [SCRIPT] |
| 5. Deduplicación | Por `PrimaryEmailAddr`, localmente en Python | líneas 24-33 [SCRIPT] |
| 6. Inserción DB | Conexión directa MySQL (`127.0.0.1:3307`, user `workeaser`) | líneas 6, 37-38 [SCRIPT] |
| 7. Tablas afectadas | `client_accounts` (INSERT) + `users` (INSERT si email no existe) + `UPDATE client_accounts SET user_id` | líneas 61-83 [SCRIPT] |
| 8. Contraseña | Hash bcrypt hardcodeado (`changeme123`) para todos los usuarios nuevos | línea 8 [SCRIPT] |
| 9. Marcador | `last_name = 'QBO'` en `users` para identificar clientes importados | línea 72 [SCRIPT] |

**¿Existe mapeo de IDs Workeaser↔QBO?**

**NO.** El script NO almacena el `customer_id` de QBO en ninguna tabla. Las tablas `client_accounts` e `users` no tienen columna para ello [BANCO]:

- `client_accounts`: columnas = `id`, `user_id`, `company_name`, `company_email`, `company_phone`, `company_address_id`, `company_photo_id`, `cowork_account_id`, `location_id`, `client_acc_local_account_id`, `uuid` — **sin `qbo_customer_id`** [BANCO — workeaser-db.sql:445-468]
- `users`: columnas incluyen `stripe_customer_id` (Stripe) pero **sin columna QBO** [BANCO]

El único "mapeo" es el email: el script usa el email de QBO para evitar duplicados (`existing_emails`), pero no persiste ninguna referencia al ID de QBO. Los 240 clientes en la DB se identifican solo por tener `users.last_name = 'QBO'` (237 filas en el dump) [BANCO].

**¿Existe código de import vivo?**

**No.** El script `import-qbo-customers.py` **no usa ningún endpoint de la API de Workeaser** — se conecta directamente a MySQL (`127.0.0.1:3307`) con `pymysql` y hace INSERTs directos a `client_accounts` y `users` [SCRIPT — líneas 36-83]. El endpoint `POST /api/auth/import` (registrado en `start/routes/auth.ts:13`, sin middleware de autenticación) es una **ruta muerta**: `AuthController` no tiene método `import` — devolvería 500 si se invocara [CODIGO].

Los endpoints de import del sistema (`POST /api/cowork/clients/import`, `/import-simple`) son imports genéricos CSV/JSON — no tienen lógica de QBO.

---

## 3. ¿Existe vínculo factura/pago↔QBO en el schema?

### NO. Ninguna tabla tiene columnas de referencia a QBO.

**Tablas del núcleo financiero inspeccionadas:**

| Tabla | Columnas de referencia externa | ¿QBO? | Evidencia |
|-------|-------------------------------|-------|-----------|
| `invoices` | `uuid`, `invoice_local_account_id` | ❌ No | workeaser-db.sql:1733-1759 [BANCO] |
| `invoice_items` | sin columnas externas | ❌ No | workeaser-db.sql:1663 [BANCO] |
| `payments` | `integration_service` (varchar), `gateway_id` (varchar) | ❌ No — son genéricos para Stripe, vacíos | workeaser-db.sql:2637-2662 [BANCO] |
| `payment_histories` | sin columnas externas | ❌ No | [BANCO] |
| `cards` | `integration_service`, `gateway_id` | ❌ No — Stripe | [BANCO] |
| `bank_accounts` | `integration_service`, `gateway_id` | ❌ No — Plaid | [BANCO] |
| `linked_bank_accounts` | `integration_service`, `gateway_id` | ❌ No — Plaid | [BANCO] |

**No existen columnas** `qbo_invoice_id`, `qbo_payment_id`, `qbo_customer_id`, `qbo_sync_status`, `qbo_sync_at`, `external_id`, `external_ref` ni similares en ninguna de las 110 tablas del schema [BANCO].

**Tablas de sincronización/integración que SÍ existen pero NO son QBO:**
- `calendar_integrations` — OAuth de Google/Outlook Calendar
- `user_integrations` — key/value genérico (vacía)
- `webhook_dead_letter_queue` — cola de webhooks fallidos (providers: stripe, docusign, boldsign — no qbo)
- `cowork_stripe_accounts`, `cowork_external_accounts` — Stripe Connect

**Migraciones:** 317 archivos de migración (313 en workeaser-api + 4 en admin-api). Ninguno contiene `qbo`, `quickbooks`, `intuit`, o `external_id`. [CODIGO]

---

## 4. Estado para el modelo objetivo

### Modelo objetivo: "Crear invoice en QBO por API + registrar pago aplicado + leer estado de pago desde QBO"

| Capacidad | Estado | Evidencia |
|-----------|--------|-----------|
| **Cliente HTTP a QBO API** | 🔴 A CONSTRUIR | 0 código; no existe SDK, no existe cliente REST, no existe manejo de OAuth2 Intuit |
| **Autenticación OAuth2 Intuit** | 🔴 A CONSTRUIR | 0 código; tokens OAuth solo existen en script Python externo; no hay refresh token flow, no hay storage de tokens en DB |
| **Configuración (env vars)** | 🔴 A CONSTRUIR | 0 variables: sin `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_REALM_ID`, `QBO_ACCESS_TOKEN`, `QBO_REFRESH_TOKEN` |
| **Mapeo de clientes Workeaser↔QBO** | 🔴 A CONSTRUIR | No existe columna `qbo_customer_id` en `client_accounts` ni `users`; 240 clientes importados sin referencia al ID de QBO |
| **Crear invoice en QBO** | 🔴 A CONSTRUIR | No existe endpoint, servicio ni lógica |
| **Registrar pago en QBO** | 🔴 A CONSTRUIR | No existe endpoint, servicio ni lógica |
| **Leer estado de pago desde QBO** | 🔴 A CONSTRUIR | No existe webhook entrante de QBO, no existe polling de estado |
| **Sincronización recurrente** | 🔴 A CONSTRUIR | No existe task en el scheduler para QBO; el scheduler mismo no corre (ver auditoría principal Módulo G) |
| **Webhook de QBO** | 🔴 A CONSTRUIR | No existe ruta, controlador ni middleware para webhooks de Intuit/QBO |
| **UI de configuración QBO** | 🔴 A CONSTRUIR | 0 referencias en frontend; página `settings/integrations/index.tsx` (18 líneas) no menciona QBO |
| **Columna sync_status en facturas** | 🔴 A CONSTRUIR | Tabla `invoices` sin columnas de sincronización externa |
| **Registro de auditoría de sync** | 🔴 A CONSTRUIR | No existe tabla de log de sincronización contable |

**Conclusión:** El modelo objetivo requiere construir la integración QBO **completamente desde cero**. No hay absolutamente nada que rescatar del código actual. Lo único que existe es:
1. El script `import-qbo-customers.py` como referencia de qué OAuth tokens y endpoints se usaron para la consulta inicial de customers (NO para escritura)
2. Los 240 clientes en la base de datos (sin mapeo a IDs de QBO)
3. Documentación que clasifica QBO como "no es integración del sistema — importación puntual" y lo lista como deuda técnica P1 [DOC]

---

## 5. Lo que SÍ se necesitaría construir (arquitectura objetivo)

Para el modelo descrito, habría que construir:

```
┌─────────────────────────────────────────────────────┐
│                 Workeaser Backend                     │
├─────────────────────────────────────────────────────┤
│  app/Integrations/Accounting/                        │
│    ├── QBOImplementation.ts    (nuevo)               │
│    │   ├── createCustomer()                          │
│    │   ├── createInvoice()                           │
│    │   ├── receivePayment()                          │
│    │   └── getInvoiceStatus()                        │
│    └── QBO.api.ts              (nuevo)               │
│        └── axios → quickbooks.api.intuit.com         │
│                                                      │
│  app/Controllers/Http/Webhooks/                      │
│    └── QBOController.ts        (nuevo)               │
│                                                      │
│  app/Tasks/                                          │
│    └── QBOSyncTask.ts          (nuevo)               │
│                                                      │
│  Migraciones (2-3 nuevas):                           │
│    ├── add_qbo_customer_id_to_client_accounts        │
│    ├── add_qbo_invoice_id_to_invoices                │
│    └── add_qbo_payment_id_to_payments                │
└─────────────────────────────────────────────────────┘
```

---

## 6. Referencias documentales

La auditoría previa y los docs del proyecto son consistentes con estos hallazgos:

- `docs-analise/01-visao-geral-do-sistema.md:74` — "QBO (QuickBooks): NÃO é integração do sistema — clientes foram IMPORTADOS via script numa única carga" [DOC]
- `docs-analise/03-fluxos-e-integracoes.md:153-155` — "Status: ⚪ sem integração contínua; importação pontual concluída" [DOC]
- `docs-auditoria/16-debitos-tecnicos-e-proximos-passos.md:85` — "Integração contábil contínua QBO: memória (import foi pontual). Recomendação: Sincronização recorrente. Ordem: P3." [DOC]
- `docs-auditoria/08-integracoes.md` — QBO NO aparece en la lista de 10 integraciones documentadas [DOC]
- `docs-auditoria/22-lacunas-e-prioridades.md:30` — QBO listado como gap competitivo [DOC]


*Auditoría QBO generada el 2026-08-06. Modo 100% lectura.*
