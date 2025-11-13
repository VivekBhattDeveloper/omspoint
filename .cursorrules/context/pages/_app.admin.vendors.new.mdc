Title: _app.admin.vendors.new page
Route file: web/routes/_app.admin.vendors.new.tsx
Suggested path: /admin/vendors/new

Role/Purpose
- Streamlined form for admins to register a new vendor with contact and address information.
- Redirects to the vendor detail page immediately after creation to continue management.

Primary UI Components
- Centered `Card` containing an `AutoForm` bound to `api.vendor.create`.
- Grouped `AutoInput` fields (basic info, address) plus `SubmitResultBanner`.
- Footer controls with cancel (`Button`) and primary `AutoSubmit`.

Data Dependencies
- No loader; relies on AutoForm metadata from Gadget to render vendor fields.
- On success AutoForm returns created record (with `id`) used to navigate.

Actions & Side Effects
- Success handler navigates to `/admin/vendors/:id` using router navigate.
- Cancel button routes back to `/admin/vendors` without submitting.

Acceptance Criteria
- Required fields validated by AutoForm metadata and errors shown in `SubmitResultBanner`.
- Successful creation transitions to vendor detail view.
- Cancel always returns to index; layout responsive for small screens.

QA & Tests
- Manual: Complete form and confirm redirect & vendor created.
- Manual: Trigger validation errors (empty required) to confirm messaging.
- Manual: Test cancel route with/without dirty state to ensure no mutation.

Notes
- Future: Add breadcrumb/back button for consistent navigation with sellers pages.
- Consider pre-filling country/state defaults if multi-region support is needed.
