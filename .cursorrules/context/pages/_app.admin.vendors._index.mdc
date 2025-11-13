Title: _app.admin.vendors._index page
Route file: web/routes/_app.admin.vendors._index.tsx
Suggested path: /admin/vendors

Role/Purpose
- Admin directory for managing production vendors: browse, search, edit, or delete vendor records.
- Acts as the gateway to vendor detail pages and creation flow.

Primary UI Components
- Header with page title/description and `Add New Vendor` CTA.
- `Alert` banner when loader returns sample dataset.
- Search panel with `Input` and `Search` icon; `Table` listing vendor contact/location info with inline actions.

Data Dependencies
- Loader queries `context.api.vendor.findMany`; returns basic contact and location fields.
- Sample dataset used when loader fails; exposes `isSample` and `errorMessage`.
- Delete mutation uses `api.vendor.delete` via `useAction` and reloads window on success.

Actions & Side Effects
- Search filters client-side across name/email/location.
- Row click and keyboard events navigate to `/admin/vendors/:id`.
- Inline edit button also navigates to detail; delete button prompts and executes mutation with toast feedback.

Acceptance Criteria
- Loader fallback surfaces alert and continues to render table.
- Delete prompts confirmation, disables button while deleting, and reloads list on success.
- Search term trimming + case-insensitive matching works; clearing search resets list.
- Table remains accessible (focusable rows, enter/space handling).

QA & Tests
- Manual: Force API failure to confirm sample alert text and dataset usage.
- Manual: Verify search filters and resets correctly.
- Manual: Delete vendor path shows confirm, toast, and refresh.
- Future: Integration tests for loader fallback and action error handling.

Notes
- Replace `window.location.reload()` with state refresh once we adopt query caching.
- Consider chunking vendors or enabling server-side search for large datasets.
