Title: _app.admin.invites._index page
Route file: web/routes/_app.admin.invites._index.tsx
Suggested path: /app/admin/invites

Role/Purpose
- Provide overview of invitations (totals, token readiness) and a searchable list; enable creating and editing invites.

Primary UI Components
- PageHeader with action (New invite)
- KPI Cards: Total invites, Ready to send (with tokens), Needs action (missing tokens)
- Search input with icon
- AutoTable: columns Email, Token (code formatted)

Data Dependencies
- Loader: fetch up to 250 invites (id, inviteToken) for KPIs
- AutoTable: `api.invite` select id, email, inviteToken; supports `search` param for filtering

Actions & Side Effects
- New invite button -> `/admin/invites/new`
- Row click -> `/admin/invites/:id`
- Search updates AutoTable via `search` state

Acceptance Criteria
- KPIs show correct counts (with/without tokens)
- Search filters visible rows
- Row click navigates to detail; New invite navigates to create

QA & Tests
- TODO (unit: tests/unit/admin-invites.test.tsx): KPI computation; search filters; navigation
- TODO (e2e: tests/e2e/admin-invites.spec.ts): list loads; search; row click; new navigates

Notes
- Scaffold generated; refine before development.
