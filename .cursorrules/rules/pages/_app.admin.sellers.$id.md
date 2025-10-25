Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.sellers.$id.tsx
Additional rules
- Loader must throw 400 when `:id` missing and 404 when seller not found; do not fall back to sample data here.
- Keep delete behind `AlertDialog` and keep `isDeleting` guard so repeated clicks cannot fire duplicate mutations.
- Normalize optional fields before rendering (email/phone/address) to avoid `undefined` in the UI.
- Do not render `orders.edges` without length checks; maintain badge variant mapping for known statuses.
