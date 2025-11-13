Title: _app.admin.finance.reconciliation.new page
Route file: web/routes/_app.admin.finance.reconciliation.new.tsx
Suggested path: /app/admin/finance/reconciliation/new

Role/Purpose
- Allow finance operators to start a reconciliation run, capturing identifiers, status, date, and related order.
- Provide a lightweight fallback (cancel/back) so admins can abandon the flow without mutating data.

Primary UI Components
- `PageHeader` with cancel action that navigates back.
- Single `Card` housing an `AutoForm` (`api.financeReconciliation.create`) and `SubmitResultBanner`.
- Grid of `AutoInput`/`AutoEnumInput`/`AutoDateTimePicker`/`AutoBelongsToInput` controls plus footer buttons.

Data Dependencies
- AutoForm posts to `api.financeReconciliation.create`.
- Form fields rely on Gadget model metadata (reconciliationId, status enum, reconciliationDate, order relation).

Actions & Side Effects
- Primary submit triggers creation; `onSuccess` redirects to `/admin/finance/reconciliation`.
- Cancel buttons (header + footer) use `navigate(-1)` to return without submitting.

Acceptance Criteria
- Required fields validate through AutoForm metadata; errors surface in `SubmitResultBanner`.
- Successful submit navigates back to the reconciliation index.
- Cancel actions never call the API; layout remains responsive across breakpoints.

QA & Tests
- Manual: Submit valid payload and confirm redirect + created record.
- Manual: Trigger validation errors (empty status/id) and verify inline messaging.
- Manual: Use cancel actions to ensure no mutation occurs.

Notes
- Consider pre-populating reconciliationId/date defaults in future iterations.
- Add loader for enum options or order filtering if model constraints require scoping.
