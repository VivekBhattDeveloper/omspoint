Acceptance Criteria for OMSPoint

**Global UX & Behavior**
- Uses existing shadcn/ui components and styling in `web/components/ui/*` and helper patterns in `web/components/*`.
- Navigational flows match available routes; cancel actions return to the previous page without side effects.
- Inline validation and actionable errors; toasts/banners appear only on create/update/delete outcomes.
- The app builds without TypeScript errors and runs with the configured Vite/React Router setup.

**Authentication & Authorization**
- Sign in, sign up, verify email, and reset password flows succeed and respect `settings.gadget.ts` redirects (`signInPath`, `redirectOnSignIn`, `unauthorizedUserRedirect`).
- Unauthorized users are redirected to sign-in; signed-in users receive default roles and can access allowed pages only.
- All server mutations go through model actions; client pages avoid embedding business rules that belong on the server.

**Data Access & Dynamic Schemas**
- Pages fetch via `@gadget-client/omspoint` and use the `api` instance from `web/api.ts`.
- Dynamic schema usage sources schemas from `web/api/models/*/schema.gadget.ts` (wrappers), not from `api/models/*` directly.
- `web/api/models/index.ts` re-exports model schemas for convenience and is used consistently by pages that need schema metadata.
- Loaders gracefully fall back to sample data with a clear badge/alert when a manager is unavailable or a query fails.

**Catalog & Products**
- Admin: Product list shows records from `api.product.findMany`; detail/edit loads a product by id and updates via `api.product.update`.
- Admin: Create product (`/admin/products/new`) uses `AutoForm` with include `productName`, `price`, `productDescription`, and `order`; success navigates to the product list.
- Validations reflect the Product schema: `productName` and `productDescription` required, `price` required and numeric.
- Admin Catalog Schema page derives attribute definitions (type, required, validations, relationships) from the Product schema wrapper and updates when the schema changes.

**Orders & Shipments**
- Vendor/Admin: Order list/detail pages query via `api.order` and edits save through model actions.
- Vendor/Admin: Shipment list/detail/new use `api.shipment` managers and actions; create and update succeed with inline result banners.

**Payments & Finance**
- Admin/Seller/Vendor: Payment list/detail pages query via `api.payment` and update via `api.payment.update`.
- Admin: Finance Reconciliation list/detail/new use `api.financeReconciliation` managers; new reconciliation creates a record and navigates back to the list.
- Admin: Finance Config page fetches via `api.financeConfig.findMany`; when unavailable, it renders the sample dataset with a visible “Sample data” indicator.

**Vendors & Sellers**
- Admin: Vendors list/detail support update and delete actions with confirm flows; deleting a vendor updates the list without page reload.
- Admin: Assigning or managing sellers under a vendor uses `api.seller` managers and actions with success/failure feedback.

**Print Operations**
- Admin/Vendor: Print Jobs list/detail/new use `api.printJob` managers and actions; edits save and reflect updated status.
- Admin: Print Profiles & Jigs page fetches `printerDevice` and nested data; status badges compute correctly; on missing managers, page shows sample dataset with an alert.

**Observability & Audit**
- Admin: Audit page fetches across `auditEvent`, `complianceExport`, `scheduledReport`, `approvalRequest`, and `controlCheckpoint` when available.
- Model filter works: “All models” shows all events; selecting a model filters results deterministically.

**Error Handling & Fallbacks**
- All loaders surface network/query errors as human-readable strings; pages continue rendering with fallbacks where provided.
- Fallbacks display an explicit badge (e.g., “Sample dataset”) and do not attempt mutations.

**Performance & Quality**
- Build passes with `yarn build` on a clean workspace; no console errors during route navigation.
- Large lists are limited via `first` and sensible sorts in queries to avoid oversized payloads.

**Developer Experience**
- New model schema edits are made in `api/models/*/schema.gadget.ts`; optional web schema wrappers are kept in `web/api/models/*/schema.gadget.ts` and re-exported from `web/api/models/index.ts`.
- Form and table components continue to use auto-components from `@gadgetinc/react/auto/shadcn` via `web/components/auto.ts` to stay consistent.
