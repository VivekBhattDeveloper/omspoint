Title: _app.admin.payments.new page
Route file: web/routes/_app.admin.payments.new.tsx
Suggested path: /app/admin/payments/new

Role/Purpose
- Log a payment capture or reconciliation entry linked to an order.

Primary UI Components
- Page header
- Card
- AutoForm: `api.payment.create`
- Inputs: `AutoNumberInput(amount)`, `AutoEnumInput(paymentMethod)`, `AutoDateTimePicker(paymentDate)`, `AutoBelongsToInput(order)`

Data Dependencies
- Model: `payment` (required: `amount`, `paymentMethod`, `paymentDate`)
- Relation: `payment.order`
- Action: `api.payment.create`

Actions & Side Effects
- Submit -> create; on success navigate to `/admin/payments`
- Amount must be a valid number; show validation errors inline

Acceptance Criteria
- Users can enter amount, select method, pick date/time, link to order
- Validation errors appear inline; successful create navigates to list with feedback

QA & Tests
- Happy: valid data creates payment
- Unhappy: missing amount, invalid date -> inline errors
- Optional E2E: create and verify appears in list

Notes
- Scaffold generated; refine before development.
