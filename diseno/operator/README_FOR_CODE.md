# Workeaser — Operator Panel · Stitch structure reference (brand-normalized)

**What this is:** the 19 Stitch-generated operator screens, normalized to the Workeaser
brand by the PM. This is a **structure reference for Code**, not final code. Use it for
per-screen layout and component structure. Do **not** treat the Stitch sidebars as
authoritative — see "Canonical navigation" below.

**What was normalized already (do not redo):**
- Brand text `ProSpace` → `Workeaser`; role labels → `Administrator` / `Assistant` / `Customer`.
- Colors pinned to brand: primary `#00A2DD`, navy/secondary `#2B3450` (old `#00658c` and the
  dark navies were remapped).
- Font set to `Laca` with `Be Vietnam Pro` fallback. **Laca webfont is NOT included** — install
  the real Laca webfont in Code; until then it renders in the fallback.
- Brand assets in `/assets` (`workeaser-logo.svg`, `workeaser-icon.png`).

**Still for Code to fix:**
- **Layout bug:** on several screens the content renders *under* the fixed sidebar. Rebuild the
  layout properly (Next.js); do not inherit this.
- Replace the Tailwind CDN + inline `tailwind.config` with the real build pipeline.
- All UI must be **English** (Stitch already is; keep it on the barrido portugués→inglés).

---

## Two levels of brand (important — this is the v2.0 white-label seed)

1. **System identity = Workeaser** — the operator/management panel (these 19 screens). Fixed:
   Workeaser logo, `#00A2DD` / `#2B3450`, Laca.
2. **Tenant identity = EWS (the company using the system)** — configured by the tenant in
   **Setup → Visual Identity**. The tenant brand (logo, company data, colors) is what appears on
   **invoices, contracts, communications, and the client portal** — NOT on the operator shell.

So: operator chrome is always Workeaser. Client-facing artifacts (invoice/contract PDF & Word,
communications, portal) must read the tenant brand from Setup → Visual Identity. Consistent with
`tenant_id` from the root and v2.0 white-label.

---

## Canonical navigation (§7) — build this ONCE as a role-gated sidebar component

Stitch rendered the sidebar differently on each screen (some `<aside>`, some other containers;
group labels varied: "Daily Operations" / "Daily Use" / "System"). **Ignore those.** The
authoritative navigation is:

### Group A — DAILY USE  (visible to Assistant + Administrator)
- Dashboard
- Clients → All Clients · Add Client
- Contracts → All Contracts · New Contract
- Bookings
- Billing & Payments → Invoices · Payments (Mark Paid) · Partner Billing
- Communication → Messages · Chat
- Documents
- Reports

### Group B — SETUP  (visible to Administrator ONLY; hidden for Assistant)
- Partners
- Locations, Rooms & Services
- Contract Templates
- Invoice Settings
- Payment Methods
- Visual Identity
- Users & Roles

**Role gating:** hide the entire Setup group from Assistant using the `CoworkRole` middleware
(built in B1). Three roles: **Administrator, Assistant, Customer**. `Documents` and `Reports`
are Daily Use (NOT under Setup).

---

## Integration to the B2 schema (deployed, commit 89779aa)

Every screen must read/write the real B2 tables (all carry `tenant_id`):

- **client_accounts** — the client register (name, company, email, phone, `pmb_number`).
  Kept complete for EVERY client, even when billed through a partner.
- **service_contracts** — one client → N contracts. Each has `service_type`, `rooms_units`
  (nullable), `billing_channel` = `DIRECT | RESELLER`, and FK `resellers` (nullable).
  **Billing channel is PER CONTRACT/SERVICE, not per client** (see `add_client` and
  `client_detail_service_billing_update`: the channel dropdown lives inside each service row).
- **rooms_units** — the "Venus 101" model: `room_number`, `display_name`, `size_sqft`,
  `capacity`, `base_price_cents`, FK location + service_type. Room price flows into the contract
  automatically. Room setup includes **photo upload** (see `setup_rooms_services`).
- **locations** — 10 EWS centers (address + assigned name).
- **service_types** — the 6: Private Office, Virtual Office, Meeting Room, Auditorium,
  Open Desk, Event On-Demand.
- **resellers** (a.k.a. Partners) — 6 seed: EWS VO Direct, Alliance Virtual, DaVinci, Hutter,
  Nelma, Sergio Souza. Managed in **Setup → Partners**; used in the client card as the billing
  **channel** combo per service. When channel = RESELLER, EWS invoices the partner; the client
  still exists fully in the register.

Prices are **negotiated per contract / per room** (Private & Virtual Office) or **per hour with
a minimum** (Meeting Room & Auditorium) — the billing engine must support a negotiated amount
per contract, not a rigid price list.

---

## Screen inventory (19)

**Daily Use:** `dashboard`, `all_clients`, `add_client`,
`client_detail_service_billing_update`, `contracts_all_contracts`, `contracts_new_contract`,
`bookings`, `billing_payments`, `communication_messages`, `communication_chat`, `documents`,
`reports`.

**Setup (Administrator only):** `setup_partners`, `setup_rooms_services`,
`setup_contract_templates`, `setup_invoice_settings`, `setup_payment_methods`,
`setup_visual_identity`, `setup_users_roles`.

Notes:
- `communication_messages` includes a message **type** selector; the type "Mail / Package
  received" reveals extra fields (what arrived, photo, pending-pickup / picked-up status).
  This replaces a separate "Virtual Office Mail" section.
- `contracts_new_contract` is the Kimmi-style generator (contract type, client + room selectors,
  live preview, export Word/PDF, send for signature via Verdocs).
