AI QA Audit – _auth.sign-in

Checklist
- Type safety: `useActionForm` typed to `api.user.signIn`; inputs typed; OK.
- Validation: Server errors mapped to `errors.user.email/password` and `errors.root`.
- Access/permissions: Public route; action allowed for unauthenticated role.
- State transitions: Sign-in followed by redirect per config.
- UX/A11y: Labels, error text, focus behavior appear correct; Button states (`disabled` while submitting).
- Performance: N/A.
- Security: Avoid echoing raw server messages; ensure CSRF in session is respected.
- Tests: Unit: submit shape + error mapping; optional E2E sign-in happy/unhappy.

Findings
- Google OAuth link preserves query string; ensure server expects these params.

Suggested fixes
- Consider adding aria-live region for top-level error to aid screen readers.
