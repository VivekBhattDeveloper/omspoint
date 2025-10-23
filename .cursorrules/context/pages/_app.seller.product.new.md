Title: _app.seller.products.new — Content Spec (Seller Create)

Route file
- web/routes/_app.seller.products.new.tsx

Path
- /app/seller/products/new

---

Role / Purpose
- Provide a Shopify-like create form for seller-managed products.
- Support two creation modes: (A) Manual entry; (B) Import from Vendor Product (auto-populate then editable).
- Let sellers attach design files, generate mockups, manage variants, and assign sales channels before saving.

Primary User Flows
1) Manual create → Basic info → Options → Variants → Media → Design → Mockups → Pricing & Inventory → Channels → Save (Draft/Active).
2) Import from vendor → Pick vendor product → Auto-fill (title/desc/media/options/variants/attributes) → Seller tweaks → Design + Mockups → Channels → Save.

Permissions / Scoping
- Only sellers with product.create permission.
- Vendor import list is scoped to allowed vendors/catalogs for this seller.

---

Header
- Title: New product
- Breadcrumbs: Catalog → Seller products → New
- Primary action: Save (disabled until minimal validity)
- Secondary: Cancel → /app/seller/products

Form Sections (Shopify-style)
1) Basic Information
   - Title (required)
   - Handle (slug, auto from Title; uniqueness check per seller)
   - Description (rich text, supports headings, lists, links)
   - Status (draft | active | archived) — default draft

2) Media
   - Product images: multi upload, reorder (drag), set featured
   - Accept: jpg/png/webp; max size, max count from config
   - Alt text per image for accessibility/SEO

3) Options & Variants
   - Toggle: This product has options (up to 3 options)
   - Options: Name + Values (chips; freeform or preset like Size/Color)
   - Generate variants grid from cartesian of values
   - Variant fields per row:
     • Title (auto from values; editable)
     • SKU (unique within product)
     • Barcode (optional)
     • Price (required if status=active)
     • CompareAtPrice (optional)
     • Cost (internal)
     • InventoryQuantity (integer; may be disabled if centralized inventory)
     • Weight (g) & HS Code (optional for export)
     • Image (select from Media)
   - Bulk tools: Set price/cost/qty for selected; copy down; CSV import/export (flagged)

4) Pricing & Inventory (single-variant defaults / bulk presets)
   - Price, CompareAt, Cost
   - Track inventory (toggle)
   - Continue selling when out of stock (toggle)

5) Vendor Import
   - CTA: Import from vendor
   - Modal:
     • Filters: Vendor, Category, Tag, Search
     • List columns: Title, Vendor, Options/Variants count, Updated
   - On select:
     • Copy title, description, media, options, variants, weight, attributes
     • Map option names and order; create variant grid accordingly
     • Copy SKUs only if policy permits (config), else regenerate SKUs
     • Mark copied fields with badge “from vendor” (optional lock)

6) Design Assignment
   - Upload/link design files: .png, .svg, .psd, .pdf (config)
   - Placement templates: Front Chest, Full Front, Back, Sleeve, etc. (from admin schema)
   - Assign design → (all variants | selected variants)
   - Small previews next to each assignment

7) Mockup Generator
   - Canvas with base image (from vendor template or current media)
   - Controls: x/y, scale, rotation, opacity, flip, alignment/snapping, safe/bleed guides
   - Print-area template overlay (from product-type schema)
   - Output on Save Mockup:
     • Flattened JPEG (min 1500px shortest side, q=0.88)
     • Store under Generated Mockups list (read-only gallery)
     • Persist config JSON (positions, transforms, asset refs)

8) Sales Channels
   - Multi-select: Shopify, Amazon, Myntra, Flipkart, Ajio, Custom
   - Per-channel subform when selected:
     • Category/Browse node (picker)
     • Attribute mapping (size/color normalization)
     • Tax/HSN/VAT code
     • Publish toggle (default off)

9) SEO
   - Page title, Meta description, Handle preview

10) Organization
   - Product Type, Collections (multi), Tags

Validation Rules
- Title required.
- If status=active → at least one variant has Price and (if tracked) non-negative inventory.
- Unique SKU per variant; unique handle per seller.
- Image type/size constraints enforced.

Save Behavior
- Create mutation on Save.
- On success → redirect to /app/seller/products/:id
- Mockup rendering may be async; store config immediately, attach generated files once available.
- Maintain vendorProductId reference and snapshot hash if imported.

Loader Prefetch
- Connected channels list
- Vendor product catalogs (paginated)
- Option presets (Size/Color templates)
- Print-area schemas per product type

Error & Edge Cases
- Import vendor product with >3 options → ask to collapse least-impact option or proceed limited
- Large variant grids (>250) → virtualize rows and provide CSV path
- Handle collision → suggest alternatives

QA / Tests
- Unit: slug generation; variant cartesian; price validation; channel mapping serialization
- E2E: vendor import flow; create & redirect; mockup save and asset presence; channel publish toggles
- Accessibility: label coverage, keyboard reordering for media, contrast on badges

Non‑Functional
- Performance: debounced validation; virtualized tables; lazy media loading
- i18n: copy via keys; currency locale from seller profile
- Observability: events product_created, mockup_generated

Notes
- Match Shopify mental model to reduce training.
- Enforce seller scoping on both loader and action.
- Store generated images/design files in versioned storage with signed URLs for vendor fulfillment visibility.
