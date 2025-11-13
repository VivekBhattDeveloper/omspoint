Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.routing._index.tsx
Additional rules
- Keep loader resilient when `routingPolicy` client is missing—always return array (never null) to simplify UI.
- Maintain normalization helpers (`parseSpecializations`, status guards) in sync with backend schema; update in one place when enum changes.
- Simulation should stay client-only; avoid blocking renders with expensive recalcs (memoize derived data).
- Ensure vendor tables remain keyboard accessible; any new controls must respect focus order.
