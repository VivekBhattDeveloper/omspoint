Title: _app.admin.finance.reconciliation.$id page
Route file: web/routes/_app.admin.finance.reconciliation.$id.tsx
Suggested path: /app/admin/finance/reconciliation/:id

Role/Purpose
- Provide admins with a detailed view of an individual reconciliation run, including linked order data and timestamps.
- Allow edits to reconciliation fields and order association while tracking status visually.

Primary UI Components
- `PageHeader` with run metadata and back button.
- Summary cards for associated order info and reconciliation details (status badge, IDs, timestamps).
- `Card` containing `AutoForm` for editing reconciliationId, status, run date, and order relation.

Data Dependencies
- Loader fetches reconciliation via `context.api.financeReconciliation.findOne`, selecting order relationship and timestamps.
- Status badge color determined by `reconciliationStatusClasses`.
- AutoForm updates via `api.financeReconciliation.update`.

Actions & Side Effects
- Save submits AutoForm; on success navigates to `/admin/finance/reconciliation`.
- Back/cancel buttons use `navigate(-1)` to exit without mutation.
- Amount/order fields formatted with `Intl.NumberFormat` / `Intl.DateTimeFormat`.

Acceptance Criteria
- Loader returns reconciliation or fails upstream; UI handles missing order gracefully.
- Status badge styling matches status variants (pending/complete/failed).
- AutoForm validation errors surface in `SubmitResultBanner`; successful save redirects.
- Date/timestamp values display human-readable formatting with fallbacks when absent.

QA & Tests
- Manual: Edit status/date/order and confirm redirect + updated detail.
- Manual: Remove order association to ensure summary card handles null gracefully.
- Manual: Trigger validation errors to verify messaging.
- Future: Unit coverage for status class helper and integration test for edit flow.

Notes
- Consider surfacing audit history or reconciliation notes in a follow-up iteration.
