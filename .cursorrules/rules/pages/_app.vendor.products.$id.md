Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.vendor.products.$id.tsx
Additional rules
- Keep loader retry logic for missing handles; when modifying selects ensure both loader and AutoForm configs stay in sync.
- If a sample fallback is implemented, it must set `isSample` and `errorMessage` so the read-only branch activates intentionally.
- Maintain keyboard accessibility within nested `AutoHasManyForm` sections; avoid wrapping forms in additional scroll containers that break focus.
- Ensure any new fields added to variants/media keep payload sizes reasonable—consider pagination if arrays become large.
