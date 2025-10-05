Title: _app.admin.products._index page
Route file: web/routes/_app.admin.products._index.tsx
Suggested path: /app/admin/products

Role/Purpose
- Provide an overview of catalog SKUs with KPIs (totals, coverage, average price) and a navigable table.
- Enable creating a new product and navigating to product detail for edits.

Primary UI Components
- PageHeader with actions (New product button)
- KPI Cards (Total SKUs, Order coverage, Average price)
- AutoTable listing products with columns: Name, Price, Order, Description, Status

Data Dependencies
- Loader fetches up to 250 `product` records (id, price, order.id) to compute KPIs
- AutoTable model: `api.product` with select: id, productName, price, productDescription, order.{id, orderId}
- Tenant/access must allow reading products

Actions & Side Effects
- Clicking New product navigates to `/admin/products/new`
- Clicking a row navigates to `/admin/products/:id`

Acceptance Criteria
- KPIs reflect current data correctly (totals, attached/unassigned, average price)
- Table renders key fields; row click navigates to detail
- New product button navigates to create page

QA & Tests
- TODO (unit: tests/unit/admin-products.test.tsx): compute KPIs from mock records; AutoTable columns render
- TODO (e2e: tests/e2e/admin-products.spec.ts): list loads; clicking row goes to detail; New product navigates to create

Notes
- Scaffold generated; refine before development.
