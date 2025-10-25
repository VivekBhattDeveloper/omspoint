Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.vendor.products._index.tsx
Additional rules
- Preserve sample fallback behavior (`isSample` flag + alert) so the UI communicates degraded states.
- Keep KPI computations in sync with loader results; any filter/pagination changes must recalc stats accordingly.
- Maintain keyboard navigation on table rows; inline buttons must stop propagation before triggering navigation.
- If adding vendor-level filters, ensure current vendor scoping remains enforced server-side.
