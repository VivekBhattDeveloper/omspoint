Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.seller.products._index.tsx
Additional rules
- Preserve loader fallback logic (handle retry + sample dataset) and always surface an alert when data is degraded.
- Keep badge variant helpers in sync with supported channels/statuses; update both mapping functions when adding new enum values.
- Maintain keyboard accessibility on table rows; any future inline controls must stop propagation before triggering navigation.
- When adding filters/pagination, ensure KPI summaries continue to reflect the full dataset, not the filtered subset.
