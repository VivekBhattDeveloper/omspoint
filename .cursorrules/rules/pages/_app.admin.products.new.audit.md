Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.products.new.tsx
Additional rules
- Confirm success navigation lands on `/admin/products`; keep redirects synced with route config.
- If price must be non-negative, enforce the constraint client-side and surface clear messaging.
