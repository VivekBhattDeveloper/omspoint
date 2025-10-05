AI QA Audit – _app.admin.invites.new

Checklist
- Type safety: email and token strings; OK.
- Validation: email required + unique on server; client shows errors.
- Access/permissions: `invite.create` must be granted.
- State transitions: Create only.
- UX/A11y: Clear labels; submit/cancel flows.
- Performance: N/A.
- Security: Validate email format; token optional. Avoid leaking server errors.
- Tests: Unit test duplicate email handling; optional E2E create.

Findings
- Unique email conflict path should surface a friendly message.

Suggested fixes
- Add specific duplicate email message mapping if server returns generic error.
