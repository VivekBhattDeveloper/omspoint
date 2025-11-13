Title: _app.seller.finance.$id page
Route file: web/routes/_app.seller.finance.$id.tsx
Suggested path: /app/seller/finance/:id

Role/Purpose
- Give sellers a detail view of a payout, including amount, method, payout timing, and linked order.
- Allow quick edits to settlement fields while keeping a task checklist visible.

Primary UI Components
- `PageHeader` with dynamic title from orderId and back button.
- KPI cards showing amount, payout timing, and follow-up checklist.
- `Card` containing `AutoForm` for payment fields (`amount`, `paymentMethod`, `paymentDate`, `order`).

Data Dependencies
- Loader fetches payment via `context.api.payment.findOne` selecting amount, method, payout date, and order relation.
- AutoForm updates record through `api.payment.update`.

Actions & Side Effects
- Save submits AutoForm and redirects to `/seller/finance` on success.
- Header back and footer cancel buttons call `navigate(-1)` without mutation.
- Currency/date fields formatted via `Intl.NumberFormat` and `Intl.DateTimeFormat`.

Acceptance Criteria
- Loader must return payment data; missing records should trigger route-level error handling.
- Cards display friendly fallbacks (`—`) when optional fields absent.
- AutoForm respects model validation and shows errors in `SubmitResultBanner`.
- Navigation buttons do not submit the form.

QA & Tests
- Manual: Update payment method/date and confirm redirect + persisted change.
- Manual: Trigger validation errors (e.g., blank amount) to verify inline messaging.
- Manual: Use back/cancel buttons to ensure navigation occurs without API call.

Notes
- Consider surfacing currency from tenant context rather than hardcoded USD.
- Checklist copy is static; replace with dynamic tasks when workflow tooling exists.
