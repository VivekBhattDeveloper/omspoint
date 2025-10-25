Title: _app.seller.products.$id page
Route file: web/routes/_app.seller.products.$id.tsx
Suggested path: /seller/products/:id

Role/Purpose
- Full-fidelity editor for a seller-managed product including channel metadata, variants, media, and SEO.
- Provides read access even when the API is down via curated sample data so the layout stays demonstrative.

Primary UI Components
- `PageHeader` with status/channel badges, last-updated timestamp, and back-to-list action.
- Optional `Alert` banner indicating sample dataset fallback with surfaced error message.
- Large `AutoForm` (selecting `sellerProductSelect`) broken into thematic `Card`s: Basic info, Channel configuration, Options, Variants, Media, Design, Mockups, SEO.
- Nested `AutoHasManyForm` groups for options, variants (with nested media), and product media.
- Footer controls with `AutoSubmit` and cancel button.

Data Dependencies
- Loader fetches seller product by id via `context.api.sellerProduct.findOne` selecting extensive relational data.
- On failure loader returns `sampleProduct`, sets `isSample` flag, and includes `errorMessage`.
- AutoForm posts to `api.sellerProduct.update`; `select` prop ensures form schema matches loader fields.

Actions & Side Effects
- Submit saves changes via AutoForm; `SubmitResultBanner` surfaces validation/API errors.
- Cancel button navigates back to `/seller/products` without mutation.
- Status/channel badges derived from helper functions to keep variant mapping consistent with index page.

Acceptance Criteria
- Loader must populate full form when record exists and fall back to sample data (with alert) when unavailable.
- All AutoForm sections render without crashing even when nested arrays (options/variants/media) are empty.
- Submit button persists updated data; cancel returns to index.
- Badge variants remain synchronized with enums used on index page.

QA & Tests
- Manual: Load valid product, edit basic fields, confirm save and toast.
- Manual: Simulate loader failure to verify sample alert and form still renders.
- Manual: Add/remove variants/options to ensure nested AutoHasMany controls behave.
- Future: Unit tests around status/channel badge helpers to ensure parity across pages.

Notes
- Replace static `sampleProduct` once server reliably returns records; consider dedicated error boundary instead of mock data.
- Evaluate splitting giant form into tabs or accordions if usability suffers.
