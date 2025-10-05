Title: _app.admin.shipments.$id page
Route file: web/routes/_app.admin.shipments.$id.tsx
Suggested path: /app/admin/shipments/:id

Role/Purpose
- Edit shipment details: tracking, method, date/time, and order linkage.

Primary UI Components
- PageHeader with Back
- Card with AutoForm bound to `api.shipment.update` and `findBy` shipment.id
- Inputs: `AutoInput(trackingNumber)`, `AutoEnumInput(shipmentMethod)`, `AutoDateTimePicker(shipmentDate)`, `AutoBelongsToInput(order)`

Data Dependencies
- Loader: `api.shipment.findOne(id)` selecting tracking, method, date, order details and metadata
- Action: `api.shipment.update`

Actions & Side Effects
- On success redirect to `/admin/shipments`
- Unique trackingNumber handled server-side; show conflict inline

Acceptance Criteria
- Users can update tracking/method/date/order; invalid entries rejected with inline errors
- Save navigates back to list; cancel returns without changes

QA & Tests
- TODO (unit: tests/unit/admin-shipments.test.tsx): update payload; duplicate tracking handling
- TODO (e2e: tests/e2e/admin-shipments.spec.ts): edit shipment and verify data reflected

Notes
- Scaffold generated; refine before development.
