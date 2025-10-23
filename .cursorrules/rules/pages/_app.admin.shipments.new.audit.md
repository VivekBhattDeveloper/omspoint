Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.shipments.new.tsx
Additional rules
- Ensure enum options come from the `shipment` model; avoid drifting hard-coded lists.
- Clarify timezone handling for `shipmentDate` (helper text or docs) so QA knows expected behavior.
