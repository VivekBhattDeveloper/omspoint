Title: _app.seller.products._index — Content Spec (Seller Product Index)

Route file
- web/routes/_app.seller.products._index.tsx

Path
- /app/seller/products

---

Role / Purpose
- Provide an overview of all seller-managed products with key performance insights.
- Track catalog health, status distribution, channel coverage, and variant volume.
- Offer direct navigation to creation (/new) and record-level editing (/:id).

Primary Objectives
1. Display summary KPIs of the seller’s catalog.
2. Provide searchable/sortable/paginated table of seller products.
3. Enable quick access to add new product or edit existing ones.

---

Page Layout Structure
- PageHeader
  • Title: “Seller Products”
  • Description: short context line (e.g., “Track catalog health, channels, statuses, and manage variants.”)
  • CTA: New Product → routes to /app/seller/products/new

- KPI Cards (3 total)
  1) Products — total count, per-status breakdown badges (active/draft/archived)
  2) Channels — unique channel count, most active channel label
  3) Variants — total variant count, average per product

- AutoTable
  • Data source: api.sellerProduct.findMany (first 250 records)
  • Columns:
    - Product Title / Handle
    - Channel Badge
    - Status Badge
    - Variant Count
    - Last Updated
    - Inline Edit button → /app/seller/products/:id

---

Loader Data Contract
Query: context.api.sellerProduct.findMany({ take:250, select:{ id,title,handle,status,channel,updatedAt, variants:{select:{id:true}}, seller:{select:{id:true,name:true}} } })

Derived Metrics:
- statusCounts: per status (active/draft/archived/unassigned)
- channelCounts: per unique channel
- topChannel: label with max frequency
- totalProducts, totalVariants, avgVariants

Returned JSON Structure:
{
  rows: [ { id,title,handle,status,channel,updatedAt,variantCount } ],
  kpis: { totalProducts, statusCounts, uniqueChannels, topChannel, totalVariants, avgVariants }
}

---

UI Details
- KPI Cards responsive grid: 1‑3 columns depending on screen width.
- Table interactions:
  • Sorting by title, updatedAt, or variantCount.
  • Pagination controls (25 rows default per page).
  • Graceful fallbacks: “Untitled product”, “—” for missing fields.
- Status badges:
  • active → default color
  • draft → secondary
  • archived → outline
  • paused → destructive
  • unassigned → muted
- Channel badges color‑coded per marketplace (future‑extendable).

---

Actions & Navigation
- “New Product” → /app/seller/products/new
- “Edit” per row → /app/seller/products/:id
- No destructive actions here (read-only overview)

---

Acceptance Criteria
- KPI cards show correct totals & averages.
- Table lists all seller products with accurate fields.
- Edit and New buttons navigate without page reload.
- Status and Channel badges display consistent, accessible colors.

---

QA / Tests
- Unit: verify loader aggregation logic for statusCounts, topChannel, avgVariants.
- UI: confirm table data & counts render correctly, navigation works.
- Accessibility: all buttons have focus states, badges maintain contrast.

---

Notes
- Extend channel color mapping when adding more marketplaces.
- Keep strict seller scoping (sellerId = currentUser.sellerId).
- Future: Add filters (by status/channel), global search, export CSV.
