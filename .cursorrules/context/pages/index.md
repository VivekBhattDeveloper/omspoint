Title: index page
Route file: web/routes/index.tsx
Suggested path: /

Role/Purpose
- Provide the default Gadget Polaris onboarding view that links developers to the file editor and sample data tools.
- Showcase the `AutoTable` integration against the `shopifyShop` model so the app renders meaningful data immediately after installation.

Primary UI Components
- Shopify Polaris primitives: `Page`, `Layout`, `Card`, `BlockStack`, `Text`, `Link`, `Box`.
- Gadget `AutoTable` component configured for `api.shopifyShop` to render shop metadata.

Data Dependencies
- Reads the `shopifyShop` model through the generated `api` client; columns include `name`, `countryName`, `currency`, `customerEmail`.
- No loader/action—AutoTable handles fetching; ensure Shopify credentials remain valid.

Actions & Side Effects
- No mutations; primary CTA is an external link guiding users to edit the route file in Gadget.
- AutoTable includes built-in pagination/filter controls; keep default behavior unless requirements change.

Acceptance Criteria
- Route loads within the Polaris shell and displays both the onboarding card and table without runtime errors.
- AutoTable queries succeed against the configured model; failure should surface via default Gadget error states.
- Links open Gadget file/model editors in a new tab.

QA & Tests
- Manual: Open `/` after installing the app to confirm the table loads and records match data in Gadget.
- Manual: Verify hyperlinks open the correct editor routes.

Notes
- Replace this onboarding surface once a custom home/dashboard experience is defined.
- If Polaris is removed elsewhere, audit this page to keep design language consistent.
