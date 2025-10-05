Title: _app.admin.payments._index page
Route file: web/routes/_app.admin.payments._index.tsx
Suggested path: /app/admin/payments

Role/Purpose
- Provide payment ledger KPIs (total volume, latest capture, method counts) and a navigable payment table.
- Enable logging new payments and navigating to details.

Primary UI Components
- PageHeader with action (Log payment)
- KPI Cards: Total volume, Most used method, Latest capture
- AutoTable: columns Amount, Method, Captured, Order

Data Dependencies
- Loader: fetch up to 250 payments (id, amount, method, date) to compute KPIs
- AutoTable model: `api.payment` with select: id, amount, paymentMethod, paymentDate, order.{id, orderId}

Actions & Side Effects
- Log payment button -> `/admin/payments/new`
- Row click -> `/admin/payments/:id`

Acceptance Criteria
- KPIs accurately reflect loader data
- Table renders correctly; row click navigates to detail
- New payment button navigates to create

QA & Tests
- TODO (unit: tests/unit/admin-payments.test.tsx): compute stats; table columns; navigation
- TODO (e2e: tests/e2e/admin-payments.spec.ts): list loads; click row; new navigates

Notes
- Scaffold generated; refine before development.
