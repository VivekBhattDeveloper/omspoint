Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.sellers._index.tsx
Additional rules
- Any destructive action must prompt for confirmation and propagate toast feedback; never delete silently.
- Keep loader fallback path intact—log errors and maintain `isSample` flag so UI can present the alert.
- Maintain keyboard navigation (row `tabIndex` + enter/space handlers) whenever table interactions change.
- If pagination is introduced, emit metrics on total sellers and surface vendor filters rather than removing the vendor column.
