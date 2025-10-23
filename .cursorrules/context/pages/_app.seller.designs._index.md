Title: _app.seller.designs._index page
Route file: web/routes/_app.seller.designs._index.tsx
Suggested path: /seller/designs

Role/Purpose
- Give sellers a workspace view of every design asset, its approval status, and where it is deployed.
- Surface quick rollups (active, awaiting approval, assignment counts) to guide prioritization.
- Provide a curated review queue so brand/compliance blockers are visible without leaving the page.

Primary UI Components
- `PageHeader` with primary CTA for uploading designs.
- Summary metric cards (Card, CardHeader, CardContent) for active/approval/assignment counts.
- `Table` with status badges, discipline icons, tag chips, and channel/product counts.
- Review queue card using badges and separators for blocker highlights.

Data Dependencies
- Primary loader reads from `api.design.findMany` when available; falls back to a seeded dataset on error or empty result.
- Requires `design` model schema (fields: name, slug, status, designType, assignedProductCount, tags, primaryChannel, lastReviewedAt, owner).

Actions & Side Effects
- No direct mutations yet; upload/brief buttons are present as future entry points.
- Loader sets `datasetSource` and `datasetError` so the UI can label sample data vs live data.

Acceptance Criteria
- Seller nav links route correctly to `/seller/designs`.
- Page renders even if the design manager is missing, with a visible “Sample dataset” badge when using fallback data.
- Status badges and discipline icons reflect the underlying enum values.
- Summary metrics reflect the rendered dataset (live or sample).

QA & Tests
- Manual: load `/seller/designs` with and without available design records; confirm fallback copy appears.
- Manual: verify table renders tags and counts, and review queue separates entries.
- Future automation: table sorting/filtering when backend design data becomes available.

Notes
- When real design records are added, remove or demote the static review queue in favor of live workflow data.
