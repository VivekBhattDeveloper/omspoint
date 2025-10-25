Title: _app.seller.products._index page
Route file: web/routes/_app.seller.products._index.tsx
Suggested path: /seller/products

Role/Purpose
- Give sellers a catalog control center summarizing product coverage, status mix, and variant footprint.
- Provide quick navigation to create or edit seller-specific products while handling API issues gracefully.

Primary UI Components
- `PageHeader` with dynamic description summarizing totals and a `New product` CTA.
- Three KPI `Card`s for total products (with status breakdown), variants managed, and channel coverage/top channel.
- Optional `Alert` banner indicating sample dataset usage or handle fallback warnings.
- `Card`-wrapped `Table` listing product title/handle, channel/status badges, variant count, last update, and inline edit button.

Data Dependencies
- Loader calls `context.api.sellerProduct.findMany` (first 250) selecting id/title/handle/channel/status/updatedAt + variant edges.
- If the API rejects the `handle` select, loader retries without it and surfaces warning; on total failure returns curated `sampleProducts`.
- Loader computes stats (`total`, `statusCounts`, `totalVariants`, `averageVariants`, `uniqueChannels`, `topChannel`) and flags `isSample`.

Actions & Side Effects
- Table rows and inline edit button navigate to `/seller/products/:id`; CTA routes to `/seller/products/new`.
- Alerts render when `isSample` true or when loader captured handle errors.
- Badges derive visual variants from channel/status mapping helpers to keep colors consistent.

Acceptance Criteria
- Loader handles three states: full data, handle fallback (no handles but still renders), and total failure (sample data + alert).
- Stats summarize the same dataset as the table (counts align).
- Table rows focusable and keyboard-activated (`Enter`/`Space`) to open detail page.
- Description copy adapts when there are zero products, guiding user to create their first product.

QA & Tests
- Manual: Force handle error to confirm fallback message and absence of handles.
- Manual: Simulate API failure to confirm sample data appears with alert.
- Manual: Validate badge variants and table navigation work on keyboard and mobile.
- Unit: cover `computeStats`, `channelBadgeVariant`, and `statusBadgeVariant` helpers.

Notes
- Replace static sample dataset once backend reliability improves; consider caching results.
- Introduce filtering/pagination when product volume exceeds 250 records.
