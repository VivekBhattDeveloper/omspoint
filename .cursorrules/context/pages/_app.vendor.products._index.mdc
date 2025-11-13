Title: _app.vendor.products._index page
Route file: web/routes/_app.vendor.products._index.tsx
Suggested path: /vendor/products

Role/Purpose
- Vendor-facing catalog dashboard summarizing product readiness, variant coverage, and asset counts.
- Entry point for creating or editing vendor-managed products while providing resilience when the API fails.

Primary UI Components
- `PageHeader` with dynamic description and `New product` CTA.
- Three KPI `Card`s: total products (status breakdown), variant coverage (avg + %), and media assets.
- Optional `Alert` banner when loader falls back to sample dataset.
- `Card`-wrapped `Table` showing title/handle/vendor, status badge, variant/media counts, updated timestamp, and inline edit button.

Data Dependencies
- Loader queries `context.api.vendorProduct.findMany` (first 250) selecting id/title/handle/status/updatedAt plus vendor, variant, and media edges.
- Computes stats (`total`, status counts, `totalVariants`, `averageVariants`, `productsWithVariants`, `variantCoverage`, `totalMedia`) and sets `isSample` on failure with curated fallback data.

Actions & Side Effects
- Row click and Edit button navigate to `/vendor/products/:id`; CTA routes to `/vendor/products/new`.
- Alert displays when `isSample` true, including surfaced `errorMessage`.
- Badge variant helper maps status to consistent styling.

Acceptance Criteria
- Loader handles success and failure (sample fallback) while keeping KPI math aligned with shown table rows.
- Table rows remain keyboard accessible and stop event propagation for inline edit button.
- Zero-state messaging appears when no products exist.
- Description text adapts when totals are zero to coach the vendor to create first item.

QA & Tests
- Manual: Force loader failure to validate alert and fallback data.
- Manual: Confirm stats match table numbers and navigation works (row click/edit/new).
- Manual: Validate sample dataset still renders accessible table structure.
- Unit: Cover `computeStats` helper to ensure averages/percentages correct.

Notes
- Consider adding filters (status/vendor) and pagination when catalog grows beyond 250 entries.
- Keep status badge variants in sync with seller catalog to avoid divergent semantics.
