Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.tsx
Additional rules
- When adding new roles or sections, update `allowedPrefixes` and default redirect in loader together.
- Keep OrgSwitcher IDs (`hq`/`print`/`marketplace`) synchronized with navigation logic and nav components.
- Error boundary should remain lightweight; if logging changes, ensure sensitive data isn’t exposed.
