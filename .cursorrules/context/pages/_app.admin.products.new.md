Title: _app.admin.products.new page
Route file: web/routes/_app.admin.products.new.tsx
Suggested path: /app/admin/products/new

Role/Purpose
- Create a new product in the master catalog and link it to an order when applicable.
- Ensure required attributes are present to activate a SKU and enable downstream usage.

Primary UI Components
- Page header with actions (Cancel)
- Card with section header
- AutoForm: `api.product.create`; fields: `productName`, `price`, `productDescription`, `order`
- Inputs: `AutoInput`, `AutoNumberInput`, `AutoBelongsToInput`, `SubmitResultBanner`, `AutoSubmit`

Data Dependencies
- Model: `product` (schema requires: `productName`, `productDescription`, `price`)
- Relation: `product.order` (belongsTo order)
- Action: `api.product.create`
- Tenant/access: must respect current role grants in `accessControl/permissions.gadget.ts`

Actions & Side Effects
- Submit -> `api.product.create` with included fields
- On success: navigate to `/admin/products` (verify route mount)
- Server-side validations enforce required fields; client should surface inline errors

Acceptance Criteria
- Users can input name, price, description; optionally link to an order
- Required fields validated client-side and server-side; errors shown inline
- Successful create navigates to products list; toast/banner indicates success
- No new dependencies introduced; UI matches existing components and spacing

QA & Tests
- Happy path: valid data -> product created -> redirected to list
- Unhappy paths: missing required fields, invalid price (non-number), server error -> surfaced to user
- Optional unit test: map form payload to action input; required fields presence
- Optional E2E: create product flow with minimal fields

Notes
- Scaffold generated; refine before development.
