Title: _app.admin.vendors.$id page
Route file: web/routes/_app.admin.vendors.$id.tsx
Suggested path: /admin/vendors/:id

Role/Purpose
- Vendor detail workspace for admins to edit vendor metadata, manage associated sellers, and perform destructive actions.
- Provides quick navigation back to vendor list and exposes seller roster at a glance.

Primary UI Components
- Breadcrumb and header with back button, delete CTA, and status messaging.
- `AutoForm` with grouped `AutoInput` controls for vendor fields plus `SubmitResultBanner`.
- Seller association card listing sellers with edit/delete buttons, `AlertDialog` confirmations, and `Add Seller` action.
- Inline error banners when delete mutations fail.

Data Dependencies
- Loader retrieves vendor by id via `context.api.vendor.findOne`, selecting contact fields and sellers edges.
- `api.vendor.update` and `api.vendor.delete` actions drive form submission and vendor deletion.
- `api.seller.delete` used to remove associated sellers; `navigate` pushes to seller create/edit flows.

Actions & Side Effects
- Successful vendor update toasts success and navigates back to `/admin/vendors`.
- Delete vendor uses dialog gating; on success toasts and redirects; on error shows inline message.
- Delete seller confirms via dialog, executes mutation, and reloads page.
- `Add Seller` button deep-links to seller creation with `vendorId` query.

Acceptance Criteria
- Loader fails gracefully when vendor missing; component assumes presence of `vendor`.
- AutoForm pre-populates values and handles success/error banners correctly.
- Delete flows respect busy states, disable buttons during mutation, and report toast feedback.
- Seller list renders badges even when some contact fields missing; empty state guides action.

QA & Tests
- Manual: Edit vendor details, ensure navigation + toast success.
- Manual: Trigger vendor delete cancel/confirm paths; confirm redirect and toast.
- Manual: Delete individual seller; ensure reload updates list.
- Future: Integration test for loader and mutation error handling.

Notes
- Replace full page reload after seller deletion with state reconciliation when shared store exists.
- Assess cascading delete implications (orders, assignments) before shipping vendor deletion to production.
