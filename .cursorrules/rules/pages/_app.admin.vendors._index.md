Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.vendors._index.tsx
Additional rules
- Preserve loader error handling and `isSample` flag so UI can surface fallback state.
- Confirm dialogs are mandatory before deleting vendors; keep toast feedback consistent with sellers list.
- Row navigation must remain keyboard friendly; any future bulk actions should not break current `tabIndex` + key handlers.
- Avoid loading more than 250 vendors client-side; introduce pagination or server filters if dataset grows.
