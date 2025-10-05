Title: _app.admin.shipments._index page
Route file: web/routes/_app.admin.shipments._index.tsx
Suggested path: /app/admin/shipments

Role/Purpose
- Provide shipment KPIs (counts, primary method, next dispatch) and a navigable shipment queue.
- Enable scheduling a new shipment and navigating to details.

Primary UI Components
- PageHeader with action (Schedule shipment)
- KPI Cards: Total shipments, Primary method, Next dispatch
- AutoTable: columns Tracking, Method, Ship date, Order

Data Dependencies
- Loader: fetch up to 250 shipments (id, method, date) to compute stats
- AutoTable model: `api.shipment` with select: id, trackingNumber, shipmentMethod, shipmentDate, order.{id, orderId}

Actions & Side Effects
- New button -> `/admin/shipments/new`
- Row click -> `/admin/shipments/:id`

Acceptance Criteria
- KPIs derive correctly from loader data
- Table renders with correct columns; row click navigates to detail
- New shipment button navigates to create page

QA & Tests
- TODO (unit: tests/unit/admin-shipments.test.tsx): compute stats; table renders; navigation callbacks
- TODO (e2e: tests/e2e/admin-shipments.spec.ts): list loads; click row navigates; schedule button navigates

Notes
- Scaffold generated; refine before development.
