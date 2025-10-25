Title: _app.seller.products.new page
Route file: web/routes/_app.seller.products.new.tsx
Suggested path: /seller/products/new

Role/Purpose
- Creation workflow for seller products with optional vendor import to seed form values.
- Mirrors the edit experience but starts with sensible defaults so sellers can launch catalog entries quickly.

Primary UI Components
- `PageHeader` with cancel button linking back to index.
- `VendorImportDialog` (`Dialog` + `Table`) that lists up to 50 vendor products with search and import CTA.
- `AutoForm` configured for `api.sellerProduct.create` with grouped `Card` sections identical to the detail editor (basic info, channel config, options, variants, media, design, mockups, SEO).
- `SubmitResultBanner` for validation feedback.

Data Dependencies
- Loader fetches recent vendor products via `context.api.vendorProduct.findMany`; returns empty list on failure.
- Form uses `defaultValues` state seeded with base defaults and optionally merged vendor data via `mapVendorProductToDefaults`.
- On success AutoForm navigates back to `/seller/products`.

Actions & Side Effects
- Import dialog merges selected vendor product fields into form defaults and bumps `formSeed` to reinitialize AutoForm.
- Submit button creates seller product; cancel button navigates without submitting.
- Dialog search filters vendor list client-side by title/handle/vendor name.

Acceptance Criteria
- Vendor import merges data correctly (options/variants pre-populated) and closes dialog.
- Form reflects defaults (status=draft, channel=manual, trackInventory=true, continueSellingWhenOutOfStock=false) when no vendor imported.
- Loader failure gracefully results in empty vendor list but form still usable.
- Successful submission navigates back to index; errors surface via `SubmitResultBanner`.

QA & Tests
- Manual: Import vendor product and confirm fields populate; submit creates record.
- Manual: Submit with missing required fields to verify validation messaging.
- Manual: Check dialog filtering and empty states.
- Future: Unit test `mapVendorProductToDefaults` transformation logic.

Notes
- Consider replacing full-page layout with stepper when onboarding non-technical sellers.
- If vendor product counts grow, paginate dialog or add server-side search.
