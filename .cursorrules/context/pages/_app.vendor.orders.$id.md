Title: _app.vendor.orders.$id page
Route file: web/routes/_app.vendor.orders.$id.tsx
Suggested path: /app/vendor/orders/:id

Role/Purpose
- Edit vendor order fields and view linked workflow (print job, shipment, payment).

Primary UI Components
- PageHeader with Back
- Summary cards (Status, Total value, Linked workflow)
- Card with AutoForm for order update; inputs: orderId, status, orderDate, total, seller
- RelatedLink buttons to print-jobs/shipping/finance if present

Data Dependencies
- Loader: `api.order.findOne(id)` selecting status, orderDate, total, seller, printJob, shipment, payment
- Action: `api.order.update`

Actions & Side Effects
- On success navigate to `/vendor/orders`
- Related links navigate to respective vendor pages when related records exist

Acceptance Criteria
- Users can update order status/date/total/seller
- Save persists and returns to list; cancel returns without changes
- Related links shown when relations exist; otherwise show fallback text

QA & Tests
- TODO (unit: tests/unit/vendor-orders.test.tsx): update payload; related links presence logic
- TODO (e2e: tests/e2e/vendor-orders.spec.ts): edit order and verify in list; navigate to related resources

Notes
- Scaffold generated; refine before development.
