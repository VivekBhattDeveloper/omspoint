Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.seller.products.$id.tsx
Additional rules
- Keep loader error handling explicit—log the error and set `isSample`; do not silently swallow failures.
- Any changes to `sellerProductSelect` must be mirrored in both loader and AutoForm `select` prop to avoid mismatched schemas.
- Preserve badge helper mappings; update both detail and index pages together when channel/status enums expand.
- Nested `AutoHasManyForm` collections should retain keyboard accessibility and not exceed reasonable hydration costs; paginate if variant counts explode.
