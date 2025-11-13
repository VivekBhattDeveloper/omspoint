Title: _app.admin.products.$id page
Route file: web/routes/_app.admin.products.$id.tsx
Suggested path: /app/admin/products/:id

Role/Purpose
- Edit an existing product’s core attributes, pricing, and order association.

Primary UI Components
- PageHeader with Back
- Card with AutoForm bound to `api.product.update` and `findBy` product.id
- Inputs: `AutoInput(productName)`, `AutoNumberInput(price)`, `AutoBelongsToInput(order)`, `AutoRichTextInput(productDescription)`

Data Dependencies
- Loader: `api.product.findOne(id)` selecting name, price, description (markdown/truncatedHTML), order(id, orderId, status), timestamps
- Action: `api.product.update`
- Access: read/update permissions for product; tenant scoping as applicable

Actions & Side Effects
- On success: navigate to `/admin/products`
- Server validations enforce required fields; client surfaces using SubmitResultBanner

Acceptance Criteria
- Users can edit name, price, description, and order link
- Successful save returns to product list with success state
- Field errors presented inline and non-blocking navigation protected until save or explicit cancel

QA & Tests
- Manual: Edit product name/price/order linkage and confirm redirect + persisted changes on index.
- Manual: Trigger validation errors (blank name, negative price) to verify SubmitResultBanner surfaces feedback.
- Future: Add unit coverage for payload shape/order association changes and E2E smoke for edit flow.

Notes
- Currency display currently hardcoded to USD; swap to tenant currency when available.
- Consider exposing activity log or audit info alongside form in future iteration.
