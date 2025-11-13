Title: _app.seller.designs._index page
Route file: web/routes/_app.seller.designs._index.tsx
Suggested path: /seller/designs

Role/Purpose
- Give sellers a full design library view with approval status, discipline, downstream channel signal, and tag hygiene in one place.
- Surface quick-rollup KPIs (active designs, awaiting approval, assigned product count) so creative ops can triage work.
- Keep the brand/compliance review queue visible with blockers listed so teams can resolve issues without navigating away.

Primary UI Components
- `PageHeader` with Upload CTA; copy describes the design library purpose.
- Metric summary cards (three `Card`s) using `Intl.NumberFormat` + `Intl.DateTimeFormat` for count / delta formatting.
- Design inventory table with status badges, discipline icon stack (`Paintbrush2`, `Layers`, `ShieldCheck`, `Upload`), tag chips, and counts per row.
- Dataset badge (`Sample dataset` vs `Live dataset`) and optional dataset error copy directly under the table header block.
- Review queue card that enumerates pending approvals with blocker badges and separators between entries.

Data Dependencies
- Loader calls `context.api.design.findMany` selecting id, name, slug, status, designType, primaryChannel, assignedProductCount, tags, and lastReviewedAt; sorted `updatedAt` descending with a cap of 250 records.
- Records are normalized in-route so missing enums default to `draft` / `print`, counts coerce to `0`, and tags filter to strings only.
- Fallback dataset (`fallbackDesigns`) shows curated examples whenever the manager is unavailable, returns no records, or throws; loader returns `datasetSource` ("live" | "fallback") and `datasetError` with the surfaced message.
- Dependent on the `design` model schema (status + designType enums, tag json array, assignedProductCount number, lastReviewedAt datetime, owner belongsTo seller).

Actions & Side Effects
- No mutations today; `Upload design` and `New concept brief` buttons are placeholders for future flows.
- Loader guarantees a stable dataset + metadata so the UI can always render badges and error messaging without conditional logic elsewhere.

Acceptance Criteria
- Seller nav routes to `/seller/designs` reliably.
- Page renders even if the design manager is missing; when fallback data is shown, badge flips to “Sample dataset” and any loader error text is visible.
- Summary metrics recalculate from the hydrated dataset so counts/assigned totals match what the table shows.
- Status badges and discipline icons stay in sync with loader-normalized enum values; tag badges only render for string tags.
- Review queue section keeps blocker badges legible and separated; CTA to assign reviewer remains available per row.

QA & Tests
- Manual: Load `/seller/designs` with seeded fallback (disable or mock the design manager) and confirm badge + dataset error copy appear.
- Manual: Verify live dataset flow renders table rows with correct status/discipline labeling and summary metrics match row counts.
- Manual: Check review queue renders all sample blockers, keeps CTA alignment, and separators drop on last item.
- Future: Add integration tests once real design data exists to guard against enum regressions and loader sorting changes.

Notes
- Once live review workflow exists, replace the static review queue with real assignments or remove to avoid confusion.
- Keep enum options in sync with the `design` schema so badges/icons stay accurate if backend updates occur.
