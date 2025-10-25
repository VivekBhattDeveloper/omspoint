Title: _app.seller._index page
Route file: web/routes/_app.seller._index.tsx
Suggested path: /app/seller

Role/Purpose
- Seller landing page summarizing key health metrics (sales, fulfillment, settlement) and orienting users toward deeper views.

Primary UI Components
- `PageHeader` with descriptive subtitle.
- Grid of three summary `Card`s displaying placeholder KPI values.

Data Dependencies
- Static placeholders only; no loader or API calls yet.

Actions & Side Effects
- No interactive actions; cards are read-only today.

Acceptance Criteria
- Page renders header and KPI grid across breakpoints (stacking on mobile).
- Placeholder values display em dash until real data wired.
- Typography and spacing match design system guidance.

QA & Tests
- Manual: Smoke-test `/seller` layout responsiveness.
- Visual regression once live metrics land to guard layout changes.

Notes
- Replace placeholders with analytics service once available; keep summary limited to <6 cards.
