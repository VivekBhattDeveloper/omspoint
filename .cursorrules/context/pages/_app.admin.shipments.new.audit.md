AI QA Audit – _app.admin.shipments.new

Checklist
- Type safety: Auto inputs map to enum/date/string; OK.
- Validation: Unique `trackingNumber`, required enum and date enforced server-side; client shows banner.
- Access/permissions: `shipment.create` must be granted for role.
- State transitions: Create only.
- UX/A11y: DateTimePicker, enum select; ensure labels and focus order are correct.
- Performance: No issues.
- Security: Validate/escape tracking number; server uniqueness prevents dupes.
- Tests: Unit test for duplicate tracking handling; optional E2E create flow.

Findings
- Enum options hard-coded by AutoEnumInput (from model); ensure options synced.
- Timezone considerations for `shipmentDate` display/submit.

Suggested fixes
- Display helper text for timezone if user confusion likely.
