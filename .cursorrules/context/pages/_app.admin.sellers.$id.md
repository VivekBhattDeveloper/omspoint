Title: _app.admin.sellers.$id page
Route file: web/routes/_app.admin.sellers.$id.tsx
Suggested path: /admin/sellers/:id

Role/Purpose
- Admin surface for reviewing and editing a single seller, including vendor context and associated orders.
- Allows destructive management (delete) with guardrails and surfaces rich contact/location data.

Primary UI Components
- Breadcrumb back to Sellers list and vendor detail when present; back button in header.
- `AutoForm` bound to `api.seller.update` for editing seller fields inline.
- Sidebar cards for vendor info, seller contact details, timestamps, plus an orders summary card with badges per status.
- `AlertDialog` gating the delete action.

Data Dependencies
- Loader fetches seller record by id via `context.api.seller.findOne`, selecting contact details, vendor relationship, and order edges.
- Orders fetched through GraphQL-esque edges; ensures `orders.edges` available before iterating.
- Delete action calls `api.seller.delete` client-side; form submission uses `api.seller.update`.

Actions & Side Effects
- Successful update toast via `onSuccess`; errors produce toast via `onFailure`.
- Delete dialog triggers API call, navigates back to `/admin/sellers`, and reports toast feedback.
- Breadcrumb links to vendor detail route when vendor exists.

Acceptance Criteria
- Loader returns data or 404; missing `id` returns 400 response.
- AutoForm renders with current seller data and persists updates.
- Delete action enforces confirmation and handles busy state while request runs.
- Orders card hides when there are no edges; vendor card hides when vendor absent.

QA & Tests
- Manual: Edit seller fields, ensure success toast and persisted data.
- Manual: Delete seller, confirm redirect + toast; cancel dialog retains record.
- Manual: Validate orders list formatting and badge variants for different statuses.
- Future: Add loader error coverage and mutation tests in integration suite.

Notes
- Consider adding optimistic state updates instead of navigating after delete.
- Ensure timezone handling for created/updated/order dates is consistent with admin expectations.
