Title: _app.admin.shipments._index page
Route file: web/routes/_app.admin.shipments._index.tsx
Suggested path: /app/admin/shipments

Role/Purpose
- Provide shipment KPIs (counts, primary method, next dispatch) and a navigable shipment queue.
- Enable scheduling a new shipment and navigating to details.

Primary UI Components
- `PageHeader` with “Schedule shipment” button.
- Optional `Alert` banner when loader falls back to sample data.
- KPI `Card`s summarizing totals, method mix, and next dispatch.
- `Card`-wrapped `Table` (not AutoTable) listing tracking, method badge, ship date, and order.

Data Dependencies
- Loader fetches up to 250 shipments via `context.api.shipment.findMany` selecting tracking, method, date, and orderId.
- Derives stats (`total`, method counts, `nextShipmentDate`); on failure returns curated `sampleShipments` with `isSample` + `errorMessage`.

Actions & Side Effects
- New button -> `/admin/shipments/new`
- Row click -> `/admin/shipments/:id`
- Table rows support keyboard navigation (Enter/Space) before routing.

Acceptance Criteria
- Loader handles both live and sample states, surfacing alert when sample data displayed.
- KPI cards align with table dataset (counts/next dispatch accurate).
- Table rows render badges/fallbacks and remain focusable; CTA navigates correctly.

QA & Tests
- Manual: Trigger loader failure to confirm alert + sample data output.
- Manual: Validate KPI calculations against displayed rows; test keyboard navigation on table rows.
- Manual: Use schedule button to ensure navigation to `/admin/shipments/new`.
- Future: Unit coverage for `computeStats` helper and integration test for loader fallback.

Notes
- Replace sample dataset once shipment service is stable; consider pagination when volume exceeds 250.
