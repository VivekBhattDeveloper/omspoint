Inherits: .cursorrules/rules/pages/DEFAULT.md
Also apply: .cursorrules/rules/forms-best-practices.md
Route file: web/routes/_app.admin.products.new.tsx
Additional rules
- Enforce required fields (`productName`, `productDescription`, `price`) server-side; mirror validations client-side.
- Keep navigation target consistent with route mount (`/admin/products`).
- Use existing AutoForm/AutoInput components; do not introduce new form libs.
