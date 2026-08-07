# Workeaser — Pantallas de referencia (Stitch, normalizadas)

16 pantallas HTML generadas en Google Stitch y **normalizadas a la marca Workeaser**.

## Qué se normalizó
- Colores de Stitch (#00658c azul apagado, #80d0ff, #151c27) reemplazados por la marca real: **#00A2DD** (cian acción) y **#2B3450** (marino). Inyectados vía `<style id="workeaser-brand-normalize">` con `!important`.
- Variables/utilidades de layout que Stitch dejaba sin definir (`ml-sidebar-width`, `w-sidebar-width`, `px-gutter`, `p-margin-page`, etc.) — definidas para que el layout no colapse.
- Basura de plantilla (`{{DATA:...}}`) eliminada.

## Uso por Code (REGLA)
- Estas pantallas son **referencia de ESTRUCTURA/LAYOUT**, no código final.
- Code toma de aquí **dónde va cada bloque**; aplica los tokens/tema reales del proyecto y el DESIGN.md.
- **Conserva el código que ya funciona** en las pantallas que el Scope marca "conservar"; solo reescribe/construye lo marcado rehacer/construir.
- Tipografía: Stitch usó Archivo Narrow + Hanken Grotesk (sustitutas). La marca es **Laca** (títulos) — Code la aplica.
- Para ver fiel: abrir en navegador (usan Tailwind CDN) o dentro del proyecto con Tailwind configurado.

## Contenido
### client/ (6)
01 dashboard (4 iconos + banda de alertas) · 02 pay_invoice (surcharge por método) · 03 documents · 04 chat (1-a-1) · 05 reservations · 06 my_account

### operator/ (10)
01 dashboard (KPIs+donut+tabla) · 02-04 services (data/loading/empty) · 05 locations_venues · 06 client_management (lista+detalle) · 07 billing_payments (crear factura+conciliación) · 08 documents_management · 09 chat (operador) · 10 login
