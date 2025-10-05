Title: _app.vendor.shipping.$id page
Route file: web/routes/_app.vendor.shipping.$id.tsx
Suggested path: /app/vendor/shipping/:id

Role/Purpose
- Adjust shipment details (carrier, tracking, date) and ensure vendor visibility to customer teams.

Primary UI Components
- PageHeader with Back
- Summary cards (Carrier method, Shipment date, Customer)
- Card with AutoForm: trackingNumber, shipmentMethod, shipmentDate, order

Data Dependencies
- Loader: `api.shipment.findOne(id)` selecting tracking/method/date and order summary
- Action: `api.shipment.update`

Actions & Side Effects
- On success navigate to `/vendor/shipping`
- Enum method limited to model options; unique trackingNumber enforced server-side

Acceptance Criteria
- Users can edit tracking, method, date; link to order
- Save returns to list; cancel discards changes

QA & Tests
- TODO (unit: tests/unit/vendor-shipping.test.tsx): update payload; unique tracking conflict maps to inline error
- TODO (e2e: tests/e2e/vendor-shipping.spec.ts): edit shipment; verify changes in list

Notes
- Scaffold generated; refine before development.
