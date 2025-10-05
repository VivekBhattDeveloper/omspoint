Title: _app.vendor.orders._index page
Route file: web/routes/_app.vendor.orders._index.tsx
Suggested path: /app/vendor/orders

Role/Purpose
- Monitor vendor-assigned orders with search and status filtering.
- Navigate to order detail to update status and related workflow links.

Primary UI Components
- PageHeader
- Search `Input` and `Select` status filter
- AutoTable: columns Order ID, Status, Seller, Total, Placed

Data Dependencies
- AutoTable model: `api.order` with select id, orderId, status, total, orderDate, seller.name
- Filter: `{ status: { equals: value } }` when status selected

Actions & Side Effects
- Row click navigates to `/vendor/orders/:id`
- Search and filter update AutoTable props

Acceptance Criteria
- Search filters rows by order id/seller; status filter narrows results
- Row click navigates to detail page

QA & Tests
- TODO (unit: tests/unit/vendor-orders.test.tsx): filter shape and search; row navigation
- TODO (e2e: tests/e2e/vendor-orders.spec.ts): search/filter interactions; row navigation works

Notes
- Scaffold generated; refine before development.
