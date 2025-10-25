Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/index.tsx
Additional rules
- Polaris layout should remain a simple two-section onboarding experience; avoid introducing app navigation that conflicts with router layouts.
- Keep the `AutoTable` configuration scoped to safe read-only columns; any mutations must move into explicit actions.
- If AutoTable is replaced, maintain a clear link back to the editable source file so new developers know where to iterate.
