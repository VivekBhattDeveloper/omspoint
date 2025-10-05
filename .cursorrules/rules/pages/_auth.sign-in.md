Inherits: .cursorrules/rules/pages/DEFAULT.md
Also apply: .cursorrules/rules/forms-best-practices.md
Route file: web/routes/_auth.sign-in.tsx
Additional rules
- Use `useActionForm(api.user.signIn)` as implemented; don’t wrap with another form library.
- Keep inline error rendering for fields and root-level errors.
- Ensure OAuth link retains current `search` params.
