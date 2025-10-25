Title: _app.admin.sellers._index page
Route file: web/routes/_app.admin.sellers._index.tsx
Suggested path: /admin/sellers

Role/Purpose
- Give administrators a searchable roster of every seller and their vendor relationship.
- Provide entry points for creating, editing, and deleting sellers while handling API outages gracefully.

Primary UI Components
- Top-level header (h1 + supporting copy) followed by search input and `Add New Seller` button.
- `Alert` banner surfaced when the loader falls back to sample data.
- `Card` wrapping a `Table` of seller rows with vendor badges, inline action buttons, and keyboard-accessible row navigation.

Data Dependencies
- Loader queries `context.api.seller.findMany` with vendor relationship; returns up to 250 records sorted by `createdAt`.
- Fallback dataset `sampleSellers` used whenever the loader throws; loader annotates `isSample` and `errorMessage`.
- Delete mutation uses `api.seller.delete` via `useAction`; relies on browser reload to refresh state.

Actions & Side Effects
- Search input filters client-side across name/email/location/vendor fields.
- Delete button prompts for confirmation, calls delete action, shows toast feedback, and reloads page.
- Row click/keyboard events navigate to `/admin/sellers/:id`; edit button routes without relying on row click.

Acceptance Criteria
- Loader returns sellers and toggles sample alert when API unavailable.
- Search reduces the visible list based on text match without mutating original dataset.
- Delete guard prevents accidental removal unless confirmed; action handles errors with toast message.
- Table rows are focusable and accessible; vendor badge hides when vendor missing.

QA & Tests
- Manual: Load page offline/with API failure to confirm sample alert message displays.
- Manual: Verify search matches multiple fields and resets when cleared.
- Manual: Delete flow shows confirm prompt, success toast, and refreshes list.
- Future: Integration test for loader fallback and delete action (mock API errors).

Notes
- Replace reload call with state mutation once we have shared cache utilities.
- Consider server-side filtering/pagination when seller count grows.
