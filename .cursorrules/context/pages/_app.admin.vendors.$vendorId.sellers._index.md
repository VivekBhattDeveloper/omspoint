Title: _app.admin.vendors.$vendorId.sellers._index page
Route file: web/routes/_app.admin.vendors.$vendorId.sellers._index.tsx
Suggested path: /admin/vendors/:vendorId/sellers

Role/Purpose
- Admin view to inspect and manage all sellers belonging to a specific vendor.
- Surfaces vendor contact details, provides seller CRUD shortcuts, and handles deletions.

Primary UI Components
- Breadcrumb navigation linking back to vendors list and vendor detail page.
- Vendor overview `Card` with contact/location info.
- Sellers table (`Table`, `Badge`) with inline edit/delete buttons and keyboard-accessible row navigation.
- `Add New Seller` button linking to vendor-scoped creation route.

Data Dependencies
- Loader fetches vendor via `context.api.vendor.findOne`; throws 400 when param missing and 404 when vendor absent.
- Loader also queries `context.api.seller.findMany` filtered by `vendorId`, computing `orderCount` from edges.
- Delete action uses `api.seller.delete`; resulting success triggers toast and window reload.

Actions & Side Effects
- Back button navigates to vendor detail via router.
- Delete seller prompts via `window.confirm` then executes mutation; reload refreshes dataset.
- Row click navigates to vendor-scoped seller view/edit routes; edit button uses `navigate` to `.../edit`.
- Add new seller button routes to vendor-specific creation path.

Acceptance Criteria
- Loader enforces param presence and vendor existence before rendering.
- Vendor metadata card handles missing fields gracefully (renders em dash when absent).
- Sellers table shows order count badge and supports keyboard navigation.
- Delete prompts confirmation and handles errors via toast; disabled state prevents duplicate clicks.

QA & Tests
- Manual: Validate loader error responses for missing/invalid vendor IDs.
- Manual: Delete seller flow shows confirm, toast, and reloads data.
- Manual: Table navigation using keyboard triggers detail route.
- Future: Integration test for filtered loader results and deletion errors.

Notes
- Replace `window.location.reload()` with state mutation once query caching is introduced.
- Consider adding pagination or server-side filters when seller count exceeds 250.
