Title: _app.vendor.print-jobs._index page
Route file: web/routes/_app.vendor.print-jobs._index.tsx
Suggested path: /app/vendor/print-jobs

Role/Purpose
- Monitor print pipeline with search and status filtering; navigate to job details.

Primary UI Components
- PageHeader
- Search `Input`, `Select` status filter
- AutoTable: columns Print Job, Status, Print date, Order

Data Dependencies
- AutoTable model: `api.printJob` select id, printJobId, status, printDate, order.orderId
- Filter on status when selected

Actions & Side Effects
- Row click -> `/vendor/print-jobs/:id`
- Search/filter wiring to AutoTable props

Acceptance Criteria
- Search and status filter operate together
- Row click navigates to detail

QA & Tests
- TODO (unit: tests/unit/vendor-print-jobs.test.tsx): filter semantics; table columns
- TODO (e2e: tests/e2e/vendor-print-jobs.spec.ts): list loads; search/filter; row click

Notes
- Scaffold generated; refine before development.
