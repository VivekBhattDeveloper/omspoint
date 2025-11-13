Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_auth.verify-email.tsx
Additional rules
- Loader must gracefully handle missing `code` (pass `null` to API and report resulting error message).
- Keep success link pointing to `gadgetConfig.authentication.signInPath` so configuration stays DRY.
- Avoid introducing client-only APIs in component body to preserve SSR compatibility.
