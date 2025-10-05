Title: _app.admin.shipments.new page
Route file: web/routes/_app.admin.shipments.new.tsx
Suggested path: /app/admin/shipments/new

Role/Purpose
- Schedule or backfill a shipment with method, timing, tracking, and order linkage.

Primary UI Components
- Page header with Cancel
- Card container
- AutoForm: `api.shipment.create`
- Inputs: `AutoInput(trackingNumber)`, `AutoEnumInput(shipmentMethod)`, `AutoDateTimePicker(shipmentDate)`, `AutoBelongsToInput(order)`

Data Dependencies
- Model: `shipment` (required: `trackingNumber` unique, `shipmentMethod`, `shipmentDate`)
- Relation: `shipment.order` (belongsTo order)
- Action: `api.shipment.create`

Actions & Side Effects
- Submit -> create; on success navigate to `/admin/shipments`
- Unique `trackingNumber` constraint; show conflict error gracefully
- Enum `shipmentMethod` must be one of [ground, air, express]

Acceptance Criteria
- Users can set tracking number, method, date/time, and link an order
- Duplicate tracking number is rejected with clear error message
- Successful create returns to shipments list; success feedback shown

QA & Tests
- Happy: valid values create shipment
- Unhappy: duplicate tracking number -> server error surfaced
- Unhappy: invalid enum or missing required -> inline errors
- E2E: basic create flow

Notes
- Scaffold generated; refine before development.
