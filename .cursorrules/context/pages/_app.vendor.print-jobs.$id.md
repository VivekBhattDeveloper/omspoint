Title: _app.vendor.print-jobs.$id page
Route file: web/routes/_app.vendor.print-jobs.$id.tsx
Suggested path: /app/vendor/print-jobs/:id

Role/Purpose
- Update print job status, timing, and order association.

Primary UI Components
- PageHeader with Back
- Summary cards (Status, Print date, Next steps)
- Card with AutoForm: inputs printJobId, status, printDate, order

Data Dependencies
- Loader: `api.printJob.findOne(id)` selecting fields and order.seller
- Action: `api.printJob.update`

Actions & Side Effects
- On success navigate to `/vendor/print-jobs`
- Status enum constraints enforced server-side; client shows inline errors

Acceptance Criteria
- Users can update status/date and order link
- Save navigates to list; cancel returns without persist

QA & Tests
- TODO (unit: tests/unit/vendor-print-jobs.test.tsx): update payload; enum validation mapping
- TODO (e2e: tests/e2e/vendor-print-jobs.spec.ts): edit job, verify status/date reflect in list

Notes
- Scaffold generated; refine before development.
