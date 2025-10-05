AI QA Audit – _app.admin.products.new

Checklist
- Type safety: AutoForm fields map to model types (string/number/richText). No `any` leaks observed in route code.
- Validation: Server requires `productName`, `productDescription`, `price`. Client shows errors via SubmitResultBanner.
- Access/permissions: Creation depends on role grants for `product.create`.
- State transitions: Create only; no draft/publish complexity here.
- UX/A11y: Inputs have labels via Auto components; buttons with clear text. Keyboard nav OK.
- Performance: Simple form; no heavy lists.
- Security: Trust server-side validation; description is richText—ensure safe rendering elsewhere.
- Tests: Consider unit test for payload shaping; optional E2E happy path.

Findings
- Navigation on success points to `/admin/products`; confirm route mount matches.
- Ensure price is non-negative (if business rule); not enforced in schema.

Suggested fixes
- Add client-side min constraint for price if required.
