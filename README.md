# README – MerchX OMS Web App (v0.1)

**App**: MerchX OMS (Multi‑Vendor · Multi‑Seller · Print Automation)  
**Roles**: Admin · Vendor · Seller  
**This README**: High‑level overview of navigation, pages, and core data model touchpoints

> For deep architecture, ERD, events, and APIs, see the Technical Spec document.

---

## 1) What this app does (high‑level)
- Single workspace for **vendors** (production/print), **sellers** (channels/listings), and **admins** (policies, finance, compliance).
- Automates print file generation (jig + profiles), order routing, shipping labels, and finance reconciliation.

---

## 2) Tech Overview (brief)
- **Frontend**: React (SPA/MPA), Router‑based layouts, Role‑gated routes.
- **Backend**: Services for Ingestion, PIM, Listing Sync, Orchestrator, PAE, Shipping, Finance, Notifications, IAM.
- **Auth**: Password + SSO (OAuth/SAML), optional MFA; RBAC scopes: Admin, Vendor*, Seller*.

---

## 3) Global App Layout
```
┌────────────────────────────────────────────────────────┐
│ Topbar: Org switcher · Search · Notifications · Help   │
├───────────────┬────────────────────────────────────────┤
│ Sidebar       │ Main Content                           │
│ (role-based)  │ Page header · Filters · Table/Canvas   │
│               │ Tabs: Overview | Activity | Settings   │
└───────────────┴────────────────────────────────────────┘
```

---

## 4) Navigation (by role)

### 4.1 Admin Console (Control Plane)
```
/admin
  ▸ Dashboard (SLOs, queue health, today’s risks)
  ▸ Organizations & Tenancy
  ▸ Users & Teams
  ▸ Roles & Permissions (RBAC)
  ▸ Feature Flags & Config
  ▸ Integrations Registry (channels, couriers)
  ▸ Secrets Vault (API keys, webhooks)
  ▸ Catalog Schema & Validation
  ▸ Print Profiles & Jig Templates
  ▸ Routing & SLA Policies
  ▸ Finance Config (fees, taxes, payout cycles)
  ▸ Compliance & Data Policies
  ▸ Observability (logs, metrics, traces, alerts)
  ▸ Incidents & Runbooks
  ▸ Audit & Reports
```

### 4.2 Vendor Console (ERP‑style)
```
/vendor
  ▸ Dashboard (capacity, SLAs, rework, payouts due)
  ▸ Orders (inbox, exceptions)
  ▸ Print Jobs (pipeline: Preflight → Jig → Imposition → Proof)
  ▸ QA & Golden Samples
  ▸ Shipping (labels, manifests)
  ▸ Returns / NDR
  ▸ Catalog
      • Upload (CSV/API) → Validation → Mapping
      • Assets (artwork, templates)
  ▸ Printers & Jigs
      • Devices, Bed Maps, Profiles, Test Prints
  ▸ Finance
      • Statements, Payouts, Debit/Credit Notes
  ▸ Reports (SLA, defects, throughput)
  ▸ Settings (bank, KYC, notifications)
```

### 4.3 Seller Console (ERP‑style)
```
/seller
  ▸ Dashboard (sales, orders, fill rate, settlements)
  ▸ Channels
      • Connect (Shopify/Marketplace)
      • Credentials & Webhooks
  ▸ Catalog
      • Import/Select (from PIM)
      • Assortments & Brand Rules
  ▸ Listings
      • Publish/Withdraw, Compliance Checks
  ▸ Orders (intake, edits/cancellations)
  ▸ Returns & RMA
  ▸ Customer Service (CS tools)
  ▸ Finance
      • Statements, Settlements
  ▸ Reports (sales, listings health)
  ▸ Settings (addresses, SLAs)
```

### 4.4 Global (all roles)
```
/me
  ▸ Profile & MFA
  ▸ API Keys (if scoped)
  ▸ Notification Preferences
/help
  ▸ Docs · Support · Status
```

---

## 5) Page‑to‑Data Model Map (high‑level)

| Area | Key Entities | Primary Actions |
|---|---|---|
| Admin → Organizations | Organization, Membership, Role | Create org, invite users, assign roles |
| Admin → Integrations | Integration, APIKey, WebhookEndpoint | Register channels/couriers, store secrets |
| Admin → Catalog Schema | Product, Variant, Attributes | Define schema rules, validators |
| Admin → Print Profiles/Jigs | PrintProfile, JigTemplate | Manage printer profiles, bed maps |
| Admin → Routing & SLA | RoutingPolicy, RouteDecision | Configure weights, view decisions |
| Admin → Finance Config | LedgerAccount, FeeRule, PayoutPolicy | Taxes, fees, payout cycles |
| Vendor → Orders/Print | Order, OrderLineItem, PrintJob, ProductionBatch | Accept, produce, QA, reprint |
| Vendor → Shipping | Shipment, Manifest | Labels, manifests, tracking |
| Vendor → Catalog | Product, Variant, Asset | Upload, validate, map |
| Vendor → Finance | LedgerEntry, Statement, Payout | Reconcile, download statements |
| Seller → Channels | ChannelAccount, Credential | Connect stores/marketplaces |
| Seller → Catalog/Assortment | Product, Variant, Listing | Import, curate, map |
| Seller → Listings | Listing | Publish/withdraw, compliance fix |
| Seller → Orders/CS | Order, ReturnRMA | Manage orders, returns/RMA |
| Seller → Finance | Statement, Settlement | Review transfers, payouts |

> See Technical Spec’s ERD for full relationships and fields.

---

## 6) Suggested Routes (starter)
- **Admin**: `/admin`, `/admin/orgs`, `/admin/users`, `/admin/rbac`, `/admin/integrations`, `/admin/secrets`, `/admin/catalog/schema`, `/admin/print/profiles`, `/admin/routing`, `/admin/finance/config`, `/admin/observability`, `/admin/audit`
- **Vendor**: `/vendor`, `/vendor/orders`, `/vendor/print-jobs`, `/vendor/qa`, `/vendor/shipping`, `/vendor/returns`, `/vendor/catalog`, `/vendor/printers`, `/vendor/finance`, `/vendor/reports`, `/vendor/settings`
- **Seller**: `/seller`, `/seller/channels`, `/seller/catalog`, `/seller/assortments`, `/seller/listings`, `/seller/orders`, `/seller/returns`, `/seller/cs`, `/seller/finance`, `/seller/reports`, `/seller/settings`
- **Global**: `/me`, `/help`

---

## 7) Minimal Data Requirements (per role)
- **Admin**: org name, domains, billing info; IAM setup (roles), integrations and secrets, catalog schema, print profiles/jigs, routing weights, finance config, data retention.
- **Vendor**: legal name, GSTIN/KYC, bank details, printer inventory, jig templates, print profiles, catalog sources, shipping pickup addresses.
- **Seller**: legal info, channel accounts (Shopify/marketplaces), webhook secrets, assortment rules, return policy, finance settlement preferences.

---

## 8) Environments & Config (quick)
- `.env`: `APP_URL`, `OAUTH_*`, `JWT_*`, `VAULT_*`, `DB_*`, `QUEUE_*`, `EMAIL_*`, `SMS_*`, `WHATSAPP_*`.
- Feature flags for: `print.engine.enabled`, `recon.auto.enabled`, `routing.failover.enabled`.

---

## 9) Onboarding Checklists
**Admin**: create org → invite users → set roles → register integrations → add secrets → define schema → add print profiles/jigs → set routing/finance → enable alerts.

**Vendor**: complete KYC/bank → add printers/jigs/profiles → test prints & golden sample → upload catalog → validate mappings → go live.

**Seller**: connect channels → import catalog → set assortments → publish listings → test order path → verify statements.

---

## 10) Glossary (quick)
- **Jig**: physical fixture aligning print on bed.  
- **Golden Sample**: approved output used as quality baseline.  
- **Assortment**: curated subset of catalog for a channel.  
- **Settlement**: statement of funds transfer to a party.

---

## 11) Contributing (short)
- Branch per feature; PR with screenshots; include route list changed + data entities touched.
- Tests: unit for UI logic; contract tests for integrations; e2e for core order → print → ship → recon.

---

## 12) Roadmap Pointers
- V2: multi‑print‑tech in one job, auto‑repricer, advanced fraud/risk, multi‑currency payouts, SLA simulations.

