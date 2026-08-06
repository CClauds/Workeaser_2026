# CONTEXTO_WORKEASER.md

## Stack Real

| Capa | Tecnología | Versión/Detalle |
|------|-----------|-----------------|
| Frontend | Next.js (React) | workeaser-management-frontend-main |
| Backend API (cliente) | AdonisJS (Node.js) | workeaser-management-api-main |
| Backend Admin | AdonisJS (Node.js) | admin-management-api-main |
| Base de datos | MySQL | workeaser_local |
| Infraestructura | Docker Compose | 5 contenedores (frontend, api, admin-api, mysql) |
| Almacenamiento local | Drive Disk "local" | tmp/uploads |
| Correo | AWS SES (local-dev) | |

## Decisiones Tomadas

### Modelo de negocio
- **Sistema B2C**: gestión de coworking para clientes directos (no marketplace de espacios).
- **Pivote FUERA de marketplace**: se elimina toda funcionalidad de marketplace entre operadores y clientes.

### Firma electrónica
- **FIRMA = Verdocs**: migrar desde las integraciones existentes (DocuSign, BoldSign, AdobeSign) hacia Verdocs como proveedor único de firma electrónica.

### Pagos
- **PAGOS = portal de pagos interno estilo CCBA**: Stripe para tarjeta de crédito + ACH. Método manual para Zelle/cheque.
- **NO Dwolla, NO Wise, NO cobro automático**: solo el envío de factura es automático (scheduler). El cobro real requiere acción del cliente en el portal.
- **Stripe**: test mode actualmente (`sk_test_localdev`).

### Documentos
- **DOCUMENTOS = Google Drive**: reemplazar el sistema actual de uploads locales (S3 local) por gestión documental sobre Google Drive, estilo CCBA.

### Chat
- **CHAT = modelo CCBA**: con historial persistente en base de datos (estilo sistema de mensajería interna entre cliente y operador).

### Pendiente
- **Scope**: definir alcance completo del pivote B2C y plan de migración.
