Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.seller.finance.$id.tsx
Additional rules
- Loader should throw when payment not found; do not silently fall back to sample data.
- Keep currency/date formatting centralized; adjust when supporting multi-currency tenants.
- Redirect path (`/seller/finance`) must stay aligned with index route; update both when routing changes.
- Guard optional relationship fields (`order`) before accessing nested properties to avoid runtime errors.
