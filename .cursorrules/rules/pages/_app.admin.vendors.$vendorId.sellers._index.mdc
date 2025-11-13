Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.vendors.$vendorId.sellers._index.tsx
Additional rules
- Loader must validate `vendorId` and throw explicit HTTP errors; never fall back to sample data here.
- Maintain keyboard support on table rows; any future bulk actions must not break `tabIndex` and key handlers.
- Keep delete confirmation (window.confirm) until replaced with AlertDialog; do not remove without adding new guard.
- Guard `seller.orderCount` display when `orders.edges` missing to avoid runtime errors.
