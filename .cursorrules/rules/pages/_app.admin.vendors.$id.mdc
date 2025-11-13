Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.vendors.$id.tsx
Additional rules
- Loader must throw if `params.id` missing/invalid; do not silently render without vendor data.
- Keep destructive controls (`Delete Vendor`, `Delete Seller`) guarded by `AlertDialog` and respect `fetching` flags to prevent duplicate submissions.
- Maintain toast + inline error feedback for mutation failures; do not swallow errors.
- Preserve `vendor.sellers.edges` length checks before rendering list; guard against undefined when API schema evolves.
