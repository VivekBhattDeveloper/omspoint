Title: _app.admin.payments.$id page
Route file: web/routes/_app.admin.payments.$id.tsx
Suggested path: /app/admin/payments/:id

Role/Purpose
- Edit payment record details (amount, method, captured date, order linkage) to maintain accurate ledger data.

Primary UI Components
- PageHeader with Back
- Card with AutoForm bound to `api.payment.update` and `findBy` payment.id
- Inputs: `AutoNumberInput(amount)`, `AutoEnumInput(paymentMethod)`, `AutoDateTimePicker(paymentDate)`, `AutoBelongsToInput(order)`

Data Dependencies
- Loader: `api.payment.findOne(id)` selects amount, method, date, order summary
- Action: `api.payment.update`

Actions & Side Effects
- On success navigate to `/admin/payments`
- Numeric validation for amount; enum constraint for method; date must be valid

Acceptance Criteria
- Users can edit amount/method/date/order; errors shown inline
- Successful save returns to list; cancel returns without persisting changes

QA & Tests
- TODO (unit: tests/unit/admin-payments.test.tsx): update payload; invalid amount handling
- TODO (e2e: tests/e2e/admin-payments.spec.ts): edit payment and verify in list

Notes
- Scaffold generated; refine before development.
