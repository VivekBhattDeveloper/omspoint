Title: _app.admin.finance.reconciliation._index page
Route file: web/routes/_app.admin.finance.reconciliation._index.tsx
Suggested path: /app/admin/finance/reconciliation

Role/Purpose
- Provide finance teams with a ledger of reconciliation runs, status mix, and ability to launch new runs.
- Surface loader failures gracefully with sample data + alert messaging.

Primary UI Components
- `PageHeader` with `New reconciliation` button.
- KPI `Card`s showing total runs, status breakdown, and latest run timestamp.
- Optional `Alert` when sample dataset displayed.
- `Card` + `Table` listing reconciliationId, status badge, run date, and order ID.

Data Dependencies
- Loader fetches up to 250 records via `context.api.financeReconciliation.findMany`.
- Computes stats via `computeStats`; on error returns curated `sampleRuns` with `isSample` & `errorMessage`.

Actions & Side Effects
- `New reconciliation` navigates to `/admin/finance/reconciliation/new`.
- Table rows navigate to `/admin/finance/reconciliation/:id`.
- Status badge styling derived from helper map.

Acceptance Criteria
- Loader success/failure both render table/KPIs; alert visible when fallback used.
- Table rows remain keyboard accessible (Enter/Space) and show friendly fallbacks when fields missing.
- Stats align with table dataset (totals/status counts).

QA & Tests
- Manual: Trigger API failure to confirm sample alert and fallback data.
- Manual: Validate navigation from CTA + row click.
- Future: Unit tests for `computeStats` and integration for loader fallback.

Notes
- Introduce filters/pagination if reconciliation volume grows beyond 250 rows.
