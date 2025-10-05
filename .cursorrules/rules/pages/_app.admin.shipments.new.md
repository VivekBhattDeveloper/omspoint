Inherits: .cursorrules/rules/pages/DEFAULT.md
Also apply: .cursorrules/rules/forms-best-practices.md
Route file: web/routes/_app.admin.shipments.new.tsx
Additional rules
- `trackingNumber` must be unique; handle conflict responses with inline error.
- `shipmentMethod` must be one of the model’s enum options; don’t allow custom values.
- Date/time picker should enforce valid date; timezone assumptions explicit.
