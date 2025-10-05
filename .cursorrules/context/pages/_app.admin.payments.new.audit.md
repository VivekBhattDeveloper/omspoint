AI QA Audit – _app.admin.payments.new

Checklist
- Type safety: amount number, enum method, dateTime, belongsTo order; OK.
- Validation: Required fields enforced server-side; client surfaces errors.
- Access/permissions: `payment.create` must be granted.
- State transitions: Create only.
- UX/A11y: Inputs labeled; button text clear.
- Performance: No concerns.
- Security: Ensure amount sanitized and non-negative if policy.
- Tests: Unit test amount validation; optional E2E happy path.

Findings
- Amount accepts any number; consider min >= 0 if business rule.

Suggested fixes
- Add client-side min and message if needed.
