Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin._index.tsx
Additional rules
- Treat cards as read-only summaries; favor navigation links to deeper reports rather than embedding complex widgets.
- When wiring data, fetch through the admin analytics service and guard loader errors with safe fallbacks so the layout still renders.
- Preserve semantic heading order (PageHeader → CardTitle) to satisfy accessibility scanners.
- Keep total card count within a single view (<=6) to avoid overwhelming the dashboard; overflow belongs on subpages.
