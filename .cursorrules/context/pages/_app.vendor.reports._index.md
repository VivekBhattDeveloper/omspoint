Title: _app.vendor.reports._index page
Route file: web/routes/_app.vendor.reports._index.tsx
Suggested path: /app/vendor/reports

Role/Purpose
- Present vendor-facing production, SLA, and finance reports with safe exports.

Primary UI Components
- PageHeader with Export summary CSV action
- Cards and tables for production, SLA, and financial health with progress and badges
- Export buttons for production, SLA, payments, reconciliations

Data Dependencies
- Loader: parallel fetch of printJob, shipment, payment, financeReconciliation within 30-day horizon; capped at 250 each
- Internal helpers compute weekly summaries, trends, and export rows

Actions & Side Effects
- Client-side CSV export with robust guards for browser environment and data shape

Acceptance Criteria
- Reports render with defensive fallbacks; export actions generate CSV without errors
- Metrics and trends match computed loader data

QA & Tests
- Consider unit tests for helper calculations and week grouping
- Consider E2E sanity for export actions if feasible in environment

Notes
- Scaffold generated; refine before development.
