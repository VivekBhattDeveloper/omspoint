Title: _app.vendor.products.$id page
Route file: web/routes/_app.vendor.products.$id.tsx
Suggested path: /vendor/products/:id

Role/Purpose
- Vendor-side workspace for editing a product’s taxonomy, variants, mockups, and production notes.
- Provides a read-only fallback layout for when the Gadget API cannot return the record yet.

Primary UI Components
- `PageHeader` with status/vendor badges, last-updated timestamp, and back-to-list button.
- Conditional sample branch showing KPI-style cards and tables when loader passes `isSample`.
- `AutoForm` configured for `api.vendorProduct.update`, broken into `Card` sections: product info, options, variants, media, print areas, mockups.
- Nested `AutoHasManyForm` blocks for options, variants (with nested media), and shared media lists.
- Footer with `AutoSubmit` and cancel button.

Data Dependencies
- Loader calls `context.api.vendorProduct.findOne`; on handle validation errors it retries without the `handle` field and flags `allowHandleSelect`.
- Loader currently returns `{ product, allowHandleSelect }`; component expects optional `isSample`/`errorMessage` if future fallback is added.
- AutoForm `select` mirrors the loader select so fields stay hydrated.

Actions & Side Effects
- Submit button persists updates; `SubmitResultBanner` shows validation/API feedback.
- Cancel navigates back to `/vendor/products`.
- Handle omission fallback ensures form still renders even when handle cannot be queried; downstream UI treats missing handle as empty string.

Acceptance Criteria
- Loader returns product data or gracefully handles missing handle by retrying without it.
- Form renders all sections even with empty arrays (options, variants, media).
- Back button and cancel button navigate without submitting.
- Any future sample fallback must set `isSample` so the read-only branch activates.

QA & Tests
- Manual: Edit core fields, save, confirm update and navigation.
- Manual: Force handle error (e.g., remove field from schema) to verify retry still renders.
- Manual: Exercise nested variant/media forms to ensure add/remove works.
- Future: Integration test covering loader fallback and AutoForm submit path.

Notes
- Consider splitting massive form into tabs/accordion for usability once data real.
- Implement actual sample fallback in loader or remove the unused branch to reduce dead code.
