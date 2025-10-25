Title: _app.admin.sellers.new page
Route file: web/routes/_app.admin.sellers.new.tsx
Suggested path: /admin/sellers/new

Role/Purpose
- Guided flow for administrators to register a new seller with contact details and vendor association.
- Keeps navigation back to the seller list while capturing all required metadata for downstream operations.

Primary UI Components
- Breadcrumb/back button combination leading to Sellers index.
- Single `Card` containing an `AutoForm` configured for `api.seller.create`, with grouped headings for basic info, address, and vendor.
- `SubmitResultBanner` for surfacing success/error states inside the form.

Data Dependencies
- Loader fetches vendor list via `context.api.vendor.findMany`; Auto components consume this to populate vendor selector.
- Form posts through Gadget `AutoForm` to `api.seller.create`.

Actions & Side Effects
- `AutoSubmit` triggers create mutation; on success the handler redirects to `/admin/sellers`.
- Cancel button links back to Sellers index without mutating state.

Acceptance Criteria
- Loader provides vendors sorted alphabetically; page renders even if vendors array empty.
- Form validates required seller fields via AutoForm metadata and displays errors via `SubmitResultBanner`.
- Successful create navigates back to Sellers index and new record appears.
- Cancel button preserves navigation history and does not submit form.

QA & Tests
- Manual: Create seller with vendor, ensure redirect and record presence.
- Manual: Submit with missing required fields to confirm inline errors.
- Manual: Ensure loader failure (e.g. vendor query error) propagates via Gadget default error boundary.

Notes
- Consider replacing `window.location.href` with router navigation once shared navigation utility exists.
- Add vendor dropdown custom component if auto-generated control lacks search/filtering.
