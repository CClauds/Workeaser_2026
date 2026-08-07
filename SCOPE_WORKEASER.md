# SCOPE — Workeaser

> **Proyecto:** Workeaser — Sistema de gestión de coworking (B2C) para Easy Work Space (EWS), Orlando.
> **Documento:** Alcance de la reconstrucción. Fuente de verdad que gobierna los prompts de construcción para Claude Code.
> **Fecha:** 2026-08-06 · **Versión:** 1.0
> **Roles:** Owner = Claudio · Project Manager = Claude (chat) · Developer = Claude Code (en disco/VPS).
> **Basado en:** `AUDITORIA_CODE_WORKEASER_2026-08-06.md` + `AUDITORIA_QBO_WORKEASER_2026-08-06.md` (ambas con PASS de sub-auditor) y la auditoría previa (`workeaser-auditoria/`, 25 docs).

---

## 0. Resumen ejecutivo

Workeaser es un sistema de gestión de coworking con portal de clientes, construido sobre AdonisJS 5 (2 APIs) + Next.js + MySQL 8.4 en Docker. La auditoría confirma que **la base es sólida y modular, con datos reales de EWS (10 unidades, ~240 clientes)**; el trabajo NO es reescribir desde cero, sino **rescatar, corregir y completar**.

Este Scope define, módulo por módulo, qué se rescata, qué se rehace y qué se construye nuevo. Tres decisiones de producto gobiernan el conjunto:

1. **Es B2C.** El portal del cliente se diseña como una app de consumidor: claridad, mínimos clics, lo accionable primero. (Distinto de CCBA, que es B2B.)
2. **Pivote fuera de marketplace.** Workeaser deja de ser marketplace; es gestión de coworking + portal de clientes. Además, **reemplaza a Plutio** como sistema de facturación de EWS.
3. **La contabilidad vive en QuickBooks Online (QBO).** Workeaser emite la factura y la registra en QBO por API; QBO concilia. Workeaser NO lleva un libro contable propio.

**Stack de integraciones (decidido y lockeado):**

| Función | Proveedor | Estado en código |
|---|---|---|
| Firma electrónica | **Verdocs** | Reemplaza a BoldSign/DocuSign/AdobeSign |
| Pagos tarjeta + ACH | **Stripe** (migrado a PaymentIntents) | Existe en Charges API legacy — rehacer |
| Verificación bancaria ACH | **Plaid** (Auth, plan pay-as-you-go) | Existe, credenciales placeholder |
| Pago manual (Zelle/cheque) | **Manual** (comprobante + conciliación admin) | Base `RECEIVED` existe |
| Documentos | **Google Drive** | No existe — construir desde cero |
| Contabilidad | **QuickBooks Online** por API | No existe — construir desde cero |
| Chat cliente-operador | **Interno** (Omnichat, patrón CCBA) | Existe funcional — activar y completar |

---

## 1. Manual de marca (fuente de verdad: `Material_Workeaser.pdf`)

> **Regla base:** el manual de marca oficial manda sobre las pantallas actuales. Las pantallas hoy NO cumplen la marca (usan colores aproximados y tipografía genérica). Se corrigen para cumplirla.

### 1.1 Colores oficiales

| Rol | Color | Uso |
|---|---|---|
| Azul primario | **`#00A2DD`** | Acción (botones primarios, ítem activo de menú, acentos, números destacados, logo) |
| Azul marino | **`#2B3450`** | Texto de títulos, encabezados de tabla, secciones oscuras, papelería |
| Fondo | **Blanco** | Fondo de página |
| Neutros | grises de apoyo | Texto secundario, bordes 1px |

**Corrección respecto al estado actual:** la app usa hoy `~#29ABE2` (cian) y `~#0E2A3B` (marino) — se reemplazan por los exactos `#00A2DD` y `#2B3450`.

### 1.2 Tipografía

- **Títulos y marca:** **Laca** (sans condensada con carácter, la del logotipo).
- **Cuerpo, UI y datos (tablas):** una sans legible de apoyo (Laca es de despliegue, no óptima para tablas densas). Criterio igual a CCBA: display para títulos + sans neutra para cuerpo.
- **Corrección respecto al estado actual:** la app usa hoy una genérica tipo Inter — se introduce Laca en títulos.

### 1.3 Logo

- Isotipo: monograma **"we"** (W + e "desenrolando") dentro de círculo abierto tipo G.
- Assets oficiales: `Workeaser_Logo.svg` (horizontal, texto marino) y `Workeaser_Icon.png` (isotipo cian).
- El ícono sirve tal cual para **favicon** y pantalla de **login**.

### 1.4 Componentes visuales (se conservan de las pantallas actuales)

- Tarjetas con esquinas redondeadas, **borde 1px, sin sombras**.
- Encabezados de tabla en marino.
- Layout limpio tipo SaaS, con aire.

---

## 2. Regla de diseño — tres capas

> Esta regla es OBLIGATORIA para el flujo Stitch → Code. Separa qué se conserva de qué se cambia.

1. **Piel visual** (colores, tipografía, tarjetas, aire) → **se CONSERVA** de las pantallas actuales. Único ajuste: colores exactos del manual (§1.1) + Laca en títulos (§1.2).
2. **Estructura visual de cada pantalla** (layout: sidebar + header con búsqueda, contenido en tarjetas, tablas con header marino) → **se CONSERVA**. Las pantallas que ya se ven bien (Dashboard, Locations, Venues, Virtual Office) son el **molde** que se replica. NO inventar un estilo de pantalla nuevo.
3. **Navegación** (qué opciones hay, cómo se agrupan, cuántos clics) → **es LO ÚNICO que se reordena** (§7).

**Resumen:** misma piel, mismo estilo de pantalla, distinta organización de menús. La única pantalla genuinamente nueva es el **dashboard del cliente** (§7.1), y aun esa hereda la misma piel y estilo de composición.

### 2.1 Reglas para el flujo Stitch → Code

- Claudio genera pantallas de referencia en **Google Stitch** (HTML), **después** de aprobado el manual de marca.
- Code toma del HTML de Stitch **solo la ESTRUCTURA/LAYOUT** — dónde va cada bloque.
- Code **NO** copia de Stitch: colores, tipografías ni textos placeholder. Los colores salen del manual (§1); los textos, del sistema real.
- Antecedente CCBA: cuando esto no se dijo explícito, Code copió un diseño alucinado (una sidebar en el login que no debía existir). Regla: **el HTML de Stitch es plano de estructura, no de decoración.**

---

## 3. Portal de pagos y facturación

### 3.1 Modelo de pagos (patrón CCBA)

- **Lo único automático es el ENVÍO de la factura** (scheduler mensual). NO hay cobro automático. NO se usa Stripe Subscriptions.
- La **factura del servicio se emite días antes** por el **monto base** (sin recargo — al emitirla aún no se sabe con qué método pagará el cliente).
- El cliente recibe la factura y paga por un **portal de pagos dentro del sistema** que le muestra, **por cada método y antes de elegir**, el costo asociado (monto base + recargo del método + total), y lo enruta según el elegido.

#### Ventana de pagos — medios, recargo y etiqueta

| Medio | Comisión Stripe | ¿Quién la paga? | Recargo al cliente | Etiqueta / tratamiento |
|---|---|---|---|---|
| **ACH** | ~0.8% (tope $5) | Cliente (recargo) | Sí, bajo | **Recomendado**, primero, "recargo bajo"; guardar cuenta para pago recurrente 1-clic |
| **Tarjeta de crédito** | ~2.9% + $0.30 | Cliente (recargo) | Sí | "Con recargo"; con salvaguarda BIN |
| **Tarjeta de débito** | ~2.9% + $0.30 | **EWS** (NO transferible por ley) | **No** (prohibido) | **Sin puerta propia** — no se destaca |
| **Zelle / cheque** | $0 | — | No | **"Sin comisión"** (los únicos realmente sin comisión); sube comprobante |

**Reglas de la ventana:**

- **Solo Zelle y cheque son "sin comisión".** ACH NO es sin comisión — tiene recargo bajo. Etiquetar ACH como "gratis" incumpliría la divulgación exigida en Florida.
- **Estrategia hacia ACH por contraste, no por etiqueta falsa:** en una renta de $500, el cliente ve **~$504 por ACH vs ~$515 por crédito**. ACH gana dicho con la verdad.
- **Débito = desincentivo por invisibilidad, no por costo** (cobrarle recargo es ilegal). Es el único medio que le cuesta dinero real a EWS (Stripe cobra igual que crédito, ~$14.80, y no es transferible). No se le da puerta propia; si un cliente entra por "crédito" y mete una débito, la **salvaguarda BIN** (`card.funding`) detecta que es débito y **no aplica recargo**.
- El recargo se pasa a Stripe dentro del total; **EWS recibe neto** en crédito y ACH.

#### Reglas de cálculo del recargo (cumplimiento de las redes / Florida)

1. **El recargo NO puede exceder el costo real** de aceptar esa tarjeta → se calcula pegado al costo real de Stripe **con tope**, nunca un % fijo inventado.
2. **No se aplica recargo a débito ni prepago** → detección por **BIN vía Stripe (`card.funding` = credit/debit/prepaid)**; recargo solo a `credit`.
3. El recargo se **anuncia antes** de completar el pago (la ventana ya lo hace) y aparece **separado** (comprobante, §3.4).
4. Siempre se ofrece **alternativa sin recargo** (Zelle/cheque) y de bajo recargo (ACH).

#### Conciliación de estado y contable

- **Estado (para el portal, NO contable):** `PENDING → PAID → RECONCILED`. `PAID` (afirmado por el cliente, ej. "envié el Zelle") no confirma; solo `RECONCILED` (webhook validado de Stripe, o admin para Zelle/cheque) confirma. Idempotente por clave de deduplicación.
- **ACH returns:** se marcan y notifican a cliente y admin; **no se revierten** en el sistema (ajuste manual en QBO).

> **Nota contable:** la conciliación **contable** la hace QBO (§5), no Workeaser. Workeaser mantiene el **estado** de factura/pago para el portal del cliente (icono Pagos).

### 3.4 Tratamiento del recargo (contable) — confirmado por el contador de EWS

- La **factura del servicio** en QBO es **siempre el monto base** (ej. $500); Workeaser registra en QBO el **pago del servicio por ese monto base**, no por lo que entró a Stripe.
- El **recargo** se documenta con una **factura/comprobante SEPARADO de comisión**, que el contador **cruza contra el reporte de comisiones que Stripe cobra a EWS** (Stripe da reportes detallados de comisiones y conciliación por payout). Ingreso por recargo (+) contra gasto de comisión de Stripe (−) = neto cero, respaldado por ambos lados.
- Workeaser **guarda internamente el recargo de cada pago** para alimentar ese reporte de cuadre.

### 3.2 Qué se rescata / rehace / construye

| Componente | Estado | Acción |
|---|---|---|
| `StripeImplementation.ts` (385 líneas) | EXISTE, Charges API legacy (2020-08-27) | **REHACER**: migrar a **PaymentIntents** (SCA, estándar actual) |
| Webhook Stripe (anti-replay + DLQ) | EXISTE robusto | RESCATAR; conectar la DLQ al scheduler (§6) |
| `/invoice-payment/[id]` (646 líneas, pago público) | EXISTE, 2 métodos (Card + Bank) | RESCATAR; extender a portal con selección de método + Manual |
| CardElement disperso (6 lugares) | EXISTE, sin portal unificado | Consolidar en un **portal de pagos** coherente |
| Método Manual (Zelle/cheque) | Base `PaymentTypesEnum = CARD\|BANK_ACCOUNT\|RECEIVED` | **CONSTRUIR** sobre `RECEIVED` |
| Facturación recurrente (`GenerateInvoice` task) | EXISTE pero **código comentado (no-op)** | **RECONSTRUIR** — es el motor de la factura mensual |
| Tablas `invoices`, `payments`, etc. | VACÍAS (1 invoice huérfana) | Poblar por operación real |

### 3.3 Lógica de facturación heredada de Plutio

Como Workeaser reemplaza a Plutio, la reconstrucción de `GenerateInvoice` hereda las reglas ya definidas en Plutio (ver `ews-plutio-migration`): día de facturación **20**, período de vencimiento **12 días**, numeración **EWS-1000**, formato de nombre de suscripción `"Virtual Office — [Company] — Monthly Rent"`, y los VO resellers (Alliance, DaVinci, Nelma) como suscripciones bulk. La fuente de verdad de datos es el Excel `Controle de Emissão de Invoice (3).xlsx`.

---

## 4. Firma electrónica — Verdocs

### 4.1 Modelo (patrón CCBA)

- Un solo proveedor: **Verdocs** (SDK `@verdocs/js-sdk`, isomórfico, corre en Node/AdonisJS).
- Flujo: admin publica plantilla → roles (Cliente + EWS) → cliente crea envelope y firma → estado por **webhook con HMAC (primario) + polling (respaldo)**.
- **El cliente nunca ve el nombre "Verdocs".**
- Editor de plantillas: cuidar el `useEffect` del editor enriquecido (no resetear cursor; sincronizar solo en cambios externos).

### 4.2 Qué se remueve (checklist de Code)

**Eliminar por completo:** `app/Integrations/BoldSign/`, `app/Integrations/AdobeSign/`, `app/Integrations/ESignature/`, `app/Middleware/BoldSignValidation.ts`, `app/Utils/BoldSign.ts`, los 3 webhook controllers (BoldSign/Docusign/AdobeSign), `BoldSignsController.ts`, `BoldSignService.ts`, las rutas de webhooks y cowork de esos proveedores, el registro de middleware en `kernel.ts:51`, los imports en `routes.ts`, el binding IoC en `AppProvider.ts:14-25`, y las deps `docusign-esign` + `@types/docusign-esign`.

**Reescribir (BoldSign → Verdocs):** `ContractService.ts` líneas 794-837 (sendContract), 839-856 (getContractPdf), 1109-1152 (getContractUrl), 1078-1107 (contractEnvelopeUpdate), 1154-1190 (ContractStatus — que además tiene un bug cross-vendor: usa AdobeSignApi con envelopeId de BoldSign); y `Client/ContractService.ts` completo.

**Frontend:** quitar tarjeta BoldSign de settings, `FetchBoldSignIdentity` en AttachContract, iframe DocuSign en EmbbedSignModal, `boldsign_logo.png`, textos "DocuSign" en index/terms/privacy.

**Env vars a eliminar:** `BOLD_SIGN_*`, `DOCUSIGN_*`, `AUTHORIZATION_ADOBE_SIGN`, `ADOBE_SIGN_API`, `CLIENTID_ADOBE_SIGN`.

### 4.3 Qué se rescata

`ContractService` (el hub del flujo de contratos, 1302 líneas), `ContractsController` (CRUD completo), modelos `Contract`, y las 13 rutas de contratos. Solo se reemplaza la capa de proveedor.

---

## 5. Integración contable — QuickBooks Online (construir desde cero)

> La auditoría QBO confirma: **cero integración en el código.** Las 12 capacidades son a construir. Lo único existente es el script one-shot `import-qbo-customers.py` y los 240 clientes ya en DB (sin mapeo).

### 5.1 Modelo objetivo

- Workeaser **crea la factura como objeto `Invoice` en QBO por API** (evita el cargo de QBO por emitir).
- Cuando el cliente paga (webhook Stripe, o admin marca Zelle/cheque), Workeaser **registra en QBO el pago aplicado a esa factura** — un solo registro, correctamente imputado.
- **Stripe NO se conecta a QBO por separado** (evita doble conteo: factura de Workeaser + pago suelto de Stripe). Workeaser es el **único puente** a QBO.
- "Bajar pagos de QBO" = **sync de seguridad**, no mecanismo primario.

### 5.2 A construir

| Capacidad | Componente |
|---|---|
| Cliente HTTP + OAuth2 Intuit (con refresh flow) | `app/Integrations/Accounting/QBOImplementation.ts` + `QBO.api.ts` |
| Crear customer / invoice / receive payment / get status | métodos de `QBOImplementation` |
| Webhook entrante de QBO | `app/Controllers/Http/Webhooks/QBOController.ts` |
| Sincronización recurrente | `app/Tasks/QBOSyncTask.ts` (requiere scheduler encendido, §6) |
| Mapeo de IDs | migraciones: `qbo_customer_id` en `client_accounts`, `qbo_invoice_id` en `invoices`, `qbo_payment_id` en `payments` |
| Config | env vars `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_REALM_ID`, tokens; Realm ID de EWS = `123146338163304` |
| UI de configuración QBO | pantalla en settings (hoy `settings/integrations` está vacía) |
| Log de auditoría de sync | tabla nueva de log contable |

### 5.3 Migración de datos obligatoria (bloqueante)

Los ~237 clientes importados **no tienen `qbo_customer_id`** (el script solo los marcó con `last_name='QBO'`). **Antes de poder facturarles en QBO por API, hay que re-mapearlos** contra QBO por email y persistir el `qbo_customer_id`. Sin este paso, la facturación a los clientes actuales no funciona.

### 5.4 Decisión pendiente del contador de EWS

Cómo se asienta en QBO la **comisión de Stripe** (el cliente paga $500, entran ~$485): registro neto vs. bruto + gasto de comisión, para que la contabilidad cuadre contra el depósito bancario. Lo decide el contador de EWS.

---

## 6. Scheduler y automatizaciones

> El scheduler **NO corre** hoy (`node server.js` sin `scheduler:run`). Es el motor de la facturación recurrente y de las colas.

### 6.1 Acción

- Agregar `node ace scheduler:run` como servicio en `docker-compose.yml` (proceso separado del API).
- **`GenerateInvoice` está comentada (no-op): reconstruirla** (§3.2) — no basta con encender el scheduler.
- Verificar idempotencia (`useLock`) en todas las tasks.
- Conectar la **DLQ de webhooks Stripe** (existe, no se procesa).

### 6.2 Las 8 tasks

RenewContractTask, GenerateInvoice (reconstruir), ProcessDataDeletion (LGPD), OverdueInvoice (revisar cron de 6 campos), ProcessEmailQueue, ProcessWhatsappQueue, ProcessWebhookRetryQueue, PlaidReconciliation. Cada una con kill switch `DISABLE_*`.

---

## 7. Navegación

### 7.1 Portal del cliente (B2C) — dashboard nuevo

> `/client` está VACÍA hoy. El dashboard es pantalla nueva; hereda la piel y el estilo de composición actuales.

**Banda superior — "lo que te toca" (alertas accionables):** aparece solo si hay algo pendiente (pago por pagar, contrato por firmar).

**Cuatro iconos:**

1. **Pagos** — muestra el saldo pendiente ($ o $0.00) en la cara del icono. Dentro: pendientes + historial de pagos.
2. **Documentos** — contratos (firmados + por firmar, estos resaltados) + documentos compartidos por el operador.
3. **Chat** — con indicador de mensajes no leídos.
4. **Reservas** — reservar sala / day pass + próximas reservas.

**Discreto (perfil arriba a la derecha):** Mi cuenta / membresía.
**Abajo:** franja de anuncios generales (mantenimiento, feriados), descartable.

**Principios:** cada icono "habla" (muestra si toca actuar) sin que el cliente entre; "pendiente de firmar/aprobar" es una TAREA (alerta arriba + marca dentro de Documentos), no un icono propio; máximo 4 iconos por escaneabilidad.

**Rutas cliente que ya existen (rescatar, reorganizar bajo el dashboard):** las 15 rutas funcionales de `/client/membership/*` (products-and-services con firma, booking-schedule, mailbox-manager, payment-and-invoices) + `/client/settings/*`. Corregir las 3 placeholder (benefits, subscriptions, payment). Post-login debe llevar al **dashboard**, no a `/spaces`.

### 7.2 Navegación del operador (staff EWS) — reordenada

> Criterio: organizar por **cómo trabaja un coworking**, no por cómo está construido el sistema. La piel y el estilo de pantalla se conservan.

| Sección nueva | Contenido | Cambio respecto a hoy |
|---|---|---|
| **Inicio** | Dashboard | Sin cambios |
| **Espacios** | Unidades (Locations/Venues) + tipos de servicio (VO, salas, desks) | Fusiona los actuales "Locations" y "Services" |
| **Clientes** | Gestión de clientes + contratos + mailbox + **chat** | Ex-"Relationship" depurado; **chat sale a la luz** (hoy comentado); leads/deals/pipeline **ocultos** |
| **Reservas** | Bookings + agenda | Extraído a primer nivel (hoy enterrado en Relationship) |
| **Facturación y Pagos** | Facturas, cobros, banking, impuestos, comisiones | Ex-"Finances", renombrado al idioma del operador y subido en prominencia |
| **Reportes** | Reportes | Sin cambios |

**Nota:** "faltaban pagos/facturación" en realidad existían bajo "Finances" — el problema era el rótulo técnico y el entierro, no la ausencia. Se resuelve renombrando y subiendo la sección.

---

## 8. Documentos — Google Drive (construir desde cero)

> Hoy es AdonisJS Drive **local** (no S3, no Drive). Google Drive **no existe** (solo Calendar). Se construye entero, con la **lógica de CCBA** portada a Node.

### 8.1 A construir

- Cliente de **Google Drive API** + OAuth con scopes de Drive.
- Estructura de carpetas **por contrato/servicio** (patrón CCBA).
- **Verificación de propiedad en cada acceso** (hoy los GET de `/documents`, `/photos`, `/videos` son **públicos sin auth** — cualquiera baja archivos adivinando el UUID: agujero crítico, §10).
- **UI de documentos independiente** (hoy solo existe dentro del flujo de contratos).
- Validación de upload (MIME/tamaño); arreglar `VideosController` sin sanitización de path.

### 8.2 Qué se rescata

Los endpoints de upload, `SafeFilename`, y el patrón de Dropzone/FileInput. Se reemplaza el backend de almacenamiento (local → Drive) y se agrega la capa de permisos y la UI.

---

## 9. Chat — Omnichat (activar y completar)

> Omnichat **es funcional** con historial persistente en DB (patrón CCBA), polling 3s. NO es código muerto.

### 9.1 Acción

- **Des-comentar** el link del sidebar (hoy oculto) y activar para todos los clientes.
- Construir **mark-as-read** (`is_read` nunca se actualiza hoy).
- Construir **adjuntos** (tablas `message_attachments/photos/videos` existen, sin uso).
- Decidir integración **WhatsApp ↔ chat interno** (hoy WhatsApp existe pero no está puenteado al chat; los inbound se guardan solo en `whatsapp_messages`).

### 9.2 Qué se rescata

UI completa de Omnichat (6 sub-componentes), `ChatController`, `ChatService`, modelos `Chat`/`ChatMessage`, las 5 rutas cowork + 5 cliente. Solo se completa (read, adjuntos) y se saca a la luz.

---

## 10. Seguridad (bloque obligatorio)

> La auditoría destapó agujeros que deben cerrarse; reacomodar la navegación sin cerrarlos sería maquillar sobre una puerta abierta.

| Hallazgo | Riesgo | Acción |
|---|---|---|
| `POST /api/auth/import` sin middleware | Creación masiva de usuarios expuesta | Proteger o eliminar (es ruta muerta sin método `import`) |
| Cookie `user-token` sin `httpOnly` | Robo de sesión vía XSS | Añadir `httpOnly` |
| GET de `/documents`, `/photos`, `/videos` públicos | Descarga de archivos sin auth (IDOR por UUID) | Auth + verificación de propiedad (§8) |
| Dashboard/search solo con `auth` | Cualquier rol logueado (incl. CLIENT) podría leer datos del cowork por URL | Añadir autorización por rol/módulo |
| Rutas cowork sin módulo específico | Acceso sin módulo habilitado | Aplicar `coworkAuthorization:${Módulo}` faltante |
| Password `changeme123` en 237 clientes importados | Clave compartida conocida | Forzar reset en primer login antes de activar clientes |
| Sin refresh token (token 1 día) | Sesión frágil | Evaluar refresh flow |
| Rate limit en memoria | Se pierde al reiniciar | Evaluar persistencia |
| Aislamiento entre clientes no verificado a fondo | Posible fuga cross-cliente | Verificar `clientAuthorization` ruta a ruta (test de aislamiento) |

---

## 11. Poda — ocultar, no borrar

> Criterio: en el pivote B2C, lo que sale de la vista se **oculta/desactiva**, no se borra, salvo que Claudio confirme lo contrario. Borrar código que funciona para reescribirlo después es mal negocio.

**Ocultar del menú (latente):** Lead Management, Deals & Opportunities, Sales Pipeline, Personas Management (maquinaria CRM/venta B2B — un coworking podría querer pipeline a futuro).

**Código muerto safe-delete (Code lo confirmó sin referencias):** Marketplace (página + componentes), Membership viejo (`pages/membership/*`, 15 archivos hardcodeados, duplica `/client/membership`), Community (links comentados), NotificationBell (deprecated), Automations (placeholder), `/client/index.tsx` vacío con layout incorrecto.

**A CONFIRMAR con Claudio antes de tocar:** `admin-api` completo (huérfano, sin frontend consumer), `pages/admin/*` (audit-logs, discounts, metrics, webhook-dlq), Stripe Connect (era marketplace), Google/Exchange Calendar (placeholder).

**NO remover:** **Plaid** (se usa para verificación bancaria instantánea del ACH — decisión ya tomada: queda en plan pay-as-you-go, solo Auth). Omnichat (es chat funcional).

**Rutas legado a limpiar:** `/membership/[id]/*` (duplica `/client/membership`), `/settings/integrations` y `/settings/payments` (renderizan vacío), `/signup` roto (la landing apunta a ruta inexistente).

---

## 12. Entorno y despliegue

- **Flujo:** Code trabaja en disco → `commit + push` a GitHub SIEMPRE → validación (Claudio + PM) → **deploy al VPS (paso SEPARADO y con compuerta; push ≠ deploy)**.
- **VPS Hetzner = staging online:** el sistema estará vivo y accesible por URL, con **Stripe/Verdocs/Plaid/QBO en sandbox**, pero **sin activar ningún cliente real**. Los ~240 clientes reales y su data NO se migran/activan hasta validación completa + orden explícita de Claudio.
- **Recomendación de VPS:** Ubuntu 24.04 LTS, holgado (~8 GB RAM / 4 vCPU / ~80 GB) — corre 4 contenedores (2 APIs Adonis + Next + MySQL).
- **GitHub:** repo `CClauds/Workeaser_2026` (backup inicial hecho, commit `88fba1a`). Secretos fuera del repo vía `.gitignore` verificado antes de cada `add`.
- **Reglas de trabajo con Code (de CCBA):** revisar el CÓMO del diff, no el verde; código de dinero/seguridad se verifica por lectura antes de desplegar; cambios de esquema se ADVIERTEN, no se hacen en silencio; sub-auditor independiente valida antes de "done"; bitácora se appendea (nunca sobrescribe); build en el VPS, no en la Mac.
- **Endurecimiento de red (Cloudflare/SSL/dominio):** DESPUÉS del end-to-end, no antes (para no confundir fallo de código con fallo de red). Cuidar que los webhooks lleguen intactos y preservar la IP real del cliente.

---

## 13. Orden de construcción sugerido (a detallar en prompts)

Los prompts de construcción se derivan de este Scope, por bloques validados. Secuencia recomendada:

1. **Estabilizar y asegurar:** arreglar las 4 pantallas de salas (null-guards + loading/error/empty + seed de módulos `VIRTUAL_OFFICE`/`MEETROOM`), cerrar los agujeros de seguridad del §10.
2. **Encender el motor:** scheduler + reconstruir `GenerateInvoice` (facturación recurrente).
3. **Pagos:** migrar Stripe a PaymentIntents + portal de pagos con los 4 métodos.
4. **QBO:** integración desde cero + re-mapeo de los 237 clientes.
5. **Firma:** migrar a Verdocs (remover los 3 proveedores).
6. **Documentos:** Google Drive + UI + permisos.
7. **Chat:** activar + mark-as-read + adjuntos.
8. **Navegación y diseño:** reordenar menús (cliente + operador), corregir marca, dashboard del cliente (con pantallas de Stitch).
9. **Poda:** ocultar/limpiar según §11.
10. **Deploy a staging + pruebas end-to-end** (factura → pagar sandbox → firmar sandbox → registrar en QBO), luego decisión de activación real.

> El orden exacto y el agrupamiento de prompts se definen con Claudio antes de cada bloque. Ningún prompt de construcción se lanza sin su autorización explícita.

---

## 14. Decisiones abiertas (para cerrar antes o durante construcción)

> El módulo de pagos quedó CERRADO: surcharge por método, legalidad del surcharge de tarjeta en Florida (validada: permitido cumpliendo reglas de redes + divulgación, ya reflejadas en §3.1), y tratamiento contable (§3.4, confirmado por el contador). No quedan decisiones abiertas de pagos.

1. **Poda a confirmar:** admin-api, pages/admin, Stripe Connect, Calendar (§11).
2. **WhatsApp ↔ chat:** ¿se integra o se deja separado? (§9.1)
3. **Plaid:** confirmar al abrir cuenta que queda en **pay-as-you-go sin mínimo mensual** (si empujan a Growth/contrato con piso, revierte a microdepósitos de Stripe).

---

*Documento generado por el PM (Claude) el 2026-08-06. Fuente de verdad para los prompts de construcción de Claude Code. Se versiona en el repo como `SCOPE_WORKEASER.md`.*
