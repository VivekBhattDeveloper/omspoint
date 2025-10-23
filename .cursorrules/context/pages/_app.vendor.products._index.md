Title: _app.vendor.products._index page

Route file: web/routes/_app.vendor.products._index.tsx

Suggested path: /app/vendor/products

Role/Purpose:

* Give vendors a snapshot of production readiness across their catalog (totals, status mix, variants, media).
* Provide navigation to create new products and drill into existing records for editing.

Primary UI Components:

* PageHeader with title/description copy and New product button.
* Three KPI Cards summarizing total products, variant coverage, and media attachments.
* AutoTable over api.vendorProduct with columns for title/handle, status badge, variant/media counts, updated timestamp, and inline edit action.

Data Dependencies:

* Loader hits context.api.vendorProduct.findMany (first 250) selecting id, title, handle, status, updatedAt, nested variants/media ids, and vendor metadata.
* Derived stats: totals, status counts, variant/media sums, and average variants per product (guarded when list empty).

Actions & Side Effects:

* New product button pushes to /vendor/products/new.
* Each row renders a ghost Edit button that routes to /vendor/products/:id.
* No inline mutations; table relies on Gadget auto components for fetching/pagination.

Acceptance Criteria:

* KPI cards accurately reflect loader-derived metrics (total, status mix, variants, media).
* Table renders expected columns with friendly fallbacks for missing title/handle and formats numbers/dates.
* Navigating via New product or row Edit routes to the correct create/detail screens.

QA & Tests:

* Unit: verify loader stats calculations with mocked vendorProduct datasets (status tallies, average variants).
* UI/E2E: ensure table loads vendor products, Edit routes to detail, New product opens creation flow.
* Accessibility: header actions keyboard-focusable; badges/buttons convey status without relying solely on color.

Notes:

* Adjust loader limit or sorting if catalog growth requires pagination strategy beyond first: 250.
* Ensure vendor-level access control keeps results scoped to the signed-in vendor.
