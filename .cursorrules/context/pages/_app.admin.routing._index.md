Title: _app.admin.routing._index page
Route file: web/routes/_app.admin.routing._index.tsx
Suggested path: /app/admin/routing

Role/Purpose
- Admin control center for routing policies: inspect vendor weightings, simulate scenario allocations, and review audit events.
- Provide guardrails when the routing service is unavailable (empty state) while still exposing policy metadata.

Primary UI Components
- `PageHeader` introducing routing orchestration and CTA stubs.
- Summary metric cards (custom `SummaryMetric`) highlighting policy/simulation health.
- Policy selector + details: vendor table with load, capacity, auto-pause thresholds, health badges; toggle checkboxes.
- Simulation configuration form (`Input`, `Select`, `Textarea`, `Checkbox`) with result table.
- Audit trail table recounting policy updates and actors.

Data Dependencies
- Loader calls optional `context.api.routingPolicy.findMany`; normalizes vendor profiles and audit entries.
- If API unavailable, loader returns empty array; UI defaults to local sample defaults.
- No mutations yet—page operates purely on loader data + local simulation state.

Actions & Side Effects
- Policy dropdown updates local state, driving vendor table and audit trail.
- Simulation form recalculates projections client-side when inputs change.
- Health badges and orchestration alerts derive styling from status helpers.

Acceptance Criteria
- Page renders even when loader returns empty policies (show empty-state copy).
- Vendor tables display normalized values (weights, capacities, health) with consistent formatting.
- Simulation results update immediately from local state and display percentages + breach probabilities.
- Audit trail sorted newest-first and surfaces notes/actors; policy selector defaults to first record.

QA & Tests
- Manual: Verify loader success path (multiple policies) and empty path (no routingPolicy API).
- Manual: Change simulation inputs to confirm result table recalculates.
- Manual: Toggle vendor controls/checkboxes and ensure visual state updates without runtime warnings.
- Future: Unit tests for normalization helpers (`parseSpecializations`, status guards) and simulation calculators.

Notes
- Consider wiring actual mutate actions (activate/publish) once routing service supports them.
- Evaluate performance of large vendor lists; may need virtualization in future.
