Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_auth.sign-in.tsx
Additional rules
- Preserve inbound query parameters when linking to Google OAuth so audit scenarios stay reproducible.
- Provide an `aria-live` region (polite) for top-level form errors to satisfy the accessibility audit.
