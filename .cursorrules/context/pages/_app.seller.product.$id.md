Title: _app.seller.products.$id — Content Spec (Seller View/Edit)

Route file
- web/routes/_app.seller.products.$id.tsx

Path
- /app/seller/products/:id

---

Role / Purpose
- Single view/edit surface for an existing seller product.
- Keep parity with Shopify-editor patterns: sectioned form, inline variant grid, media & mockups, channels, SEO.
- Support products originating from vendor import with optional field locks and passive sync prompts.

Header
- Product title (fallback: Untitled product)
- Status badge (draft/active/archived)
- Actions: Save (primary), Duplicate, Delete (danger), View on channel (if published)
- Subtext: Last updated timestamp (+ by user if available)

Overview Cards
- Channels summary (per-channel: Published | Pending | Error)
- Variants: count, total on-hand, low-stock warnings
- Mockups: total generated, last generated at

Sections (prefilled, all editable unless locked)
1) Basic Information
   - Title, Handle, Description, Status
   - Handle uniqueness check; warn if changing might break links

2) Media
   - Upload, reorder, set featured; alt text per image
   - Show storage status (synced | pending)

3) Generated Mockups
   - Gallery of generated assets; click to open configurator
   - Regenerate from stored config; supports per-variant overrides

4) Options & Variants
   - Edit options: rename, reorder, add/remove values (with propagation)
   - Variant grid (virtualized if large):
     • Title, SKU, Barcode, Price, CompareAt, Cost, Inventory, Weight, Image
   - Bulk tools: set fields for selected; assign image
   - Add variant manually; delete variant (blocked if open orders link)

5) Design Assignment
   - Current design links per variant; quick assign/unassign
   - Upload new designs; placement template picker

6) Sales Channels
   - Multi-select with per-channel subforms:
     • Category mapping, attribute normalization, tax code
     • Publish toggle & sync now button
   - Sync status row per channel (success/error message with timestamp)

7) SEO & Organization
   - Page title, Meta description, Collections, Tags, Product Type

Vendor Source Handling (if imported)
- Source chip: “Imported from {VendorName}” with link to vendor product
- Locks: admin-configurable read-only fields; tooltip explains policy
- Passive updates: if vendor changed since snapshot → show diff + Apply changes | Dismiss

Mockup Generator — Storage & Outputs
- Persist config JSON at product-level and optional per-variant override
- Render JPEG (>=1500px shortest), optional WebP; file naming {handle}-{variantKey}-mockup-{n}.jpg
- Save references on product for storefront and vendor-fulfillment visibility

Validation Rules
- Same as /new plus:
  - Prevent archiving if any channel listing is still published (confirm override)
  - Prevent deleting variants tied to open orders; surface which orders
  - Unique SKU invariant is maintained after edits

Loader / Action Contracts (illustrative)
- loader(id): sellerProduct.findUnique({ id, include: media, options, variants, designs, mockups, channels, audit })
- action(update): sellerProduct.update({ id, patches })
- action(duplicate): sellerProduct.duplicate({ id }) → returns newId
- action(delete): sellerProduct.delete({ id }) → soft-delete if policy

Activity / Audit
- Timeline: created, title changed, variant added/removed, price changed, mockup regenerated, channel publish
- Show who & when if available

Error & Edge Cases
- Large grids → virtualization & pagination
- Option changes that orphan variants → prompt to map or remove
- Channel sync errors → persist last error payload for debugging

QA / Tests
- Unit: mapping & diffing vendor updates; variant CRUD; channel state machine
- E2E: edit + save; mockup regenerate; duplicate; delete with confirm; channel publish/sync
- Accessibility: keyboard ops for tables; focus return after dialogs; badge contrast

Non‑Functional
- Performance: debounced autosave for text fields; optimistic UI for trivial edits
- i18n: all labels from keys
- Observability: product_updated, mockup_regenerated, channel_sync_triggered

Notes
- Keep UI parity with Shopify to lower training curve.
- Respect seller & role permissions on sensitive actions.
- Ensure durable, versioned storage and signed URLs for all generated assets.
