Title: _app.vendor.products.new page
Route file: web/routes/_app.vendor.products.new.tsx
Suggested path: /vendor/products/new

Role/Purpose
- Vendor workflow for creating catalog items with full control over metadata, variants, media, and mockup configuration.
- Mirrors the edit experience so vendors can seed complete product data before handing off to sellers/production.

Primary UI Components
- `PageHeader` with cancel button.
- `AutoForm` targeting `api.vendorProduct.create` with `SubmitResultBanner`.
- Series of `Card` sections: product information, options, variants, product media, print areas, mockup config, advanced data.
- Nested `AutoHasManyForm` blocks for options, variants (including nested media), and shared media assets.

Data Dependencies
- No loader; form relies on Auto metadata for vendorProduct model fields.
- Successful create navigates back to `/vendor/products`.

Actions & Side Effects
- Submit creates vendor product; cancel button navigates without mutation.
- Variant/media subforms allow adding multiple entries; ensure they remain performant.

Acceptance Criteria
- Required fields enforce validation via AutoForm; errors surfaced in `SubmitResultBanner`.
- Successful submission redirects to index; cancel always returns without hitting API.
- Layout stays responsive (single column on mobile, multi-column on desktop).

QA & Tests
- Manual: Create new product with options/variants/media to ensure payload saved.
- Manual: Attempt submission with missing required fields to verify validation messaging.
- Manual: Test cancel action to confirm no mutation occurs.
- Future: Integration coverage for create path including nested variant payload.

Notes
- Consider introducing vendor product templates or import functionality similar to seller side if needed.
- Monitor nested form performance when variant/media counts grow large.
