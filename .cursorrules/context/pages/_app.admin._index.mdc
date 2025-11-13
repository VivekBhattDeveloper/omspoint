Title: _app.admin._index page
Route file: web/routes/_app.admin._index.tsx
Suggested path: /app/admin

Role/Purpose
- Give operators a quick-read control plane landing page that frames OMS health and funnels them deeper into admin areas.
- Provide placeholders for core KPIs (orders, print queue, alerts) so downstream teams know which metrics to wire up.

Primary UI Components
- `PageHeader` with static title/description describing the admin dashboard mission.
- Three summary `Card` blocks for Orders, Print Queue Health, and Alerts with `CardHeader` + `CardContent` nodes.

Data Dependencies
- Currently static placeholders—no loader or API calls yet. When wiring real data, source should aggregate across sellers and print facilities.
- Ensure forthcoming metrics respect multi-tenant scoping and reuse existing analytics services where possible.

Actions & Side Effects
- No interactive actions today; cards are read-only.
- When adding CTAs, keep them secondary so the page remains a summary instead of a task launcher.

Acceptance Criteria
- Page renders with the header and grid layout on desktop and stacks on mobile without layout breaks.
- Placeholder metrics display em dash for missing data except Alerts which defaults to “0 open”.
- Cards remain keyboard accessible and use semantic heading levels for screen readers.

QA & Tests
- Manual: smoke test /app/admin to ensure layout spacing and responsive breakpoints hold.
- Visual regression once metrics wire up to guard spacing and typography.

Notes
- Replace placeholder values with live analytics once finance/ops APIs expose dashboards.
- Consider surfacing alert severities or linking to Observability once implemented.
