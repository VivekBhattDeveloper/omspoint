Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.seller.products.new.tsx
Additional rules
- Keep vendor import optional; the form must remain usable without vendor data and defaults should stay aligned with seller expectations.
- Any adjustments to `mapVendorProductToDefaults` must keep fields compatible with AutoForm schema (arrays of plain objects).
- Close dialog after import and bump `formSeed` so AutoForm re-renders with new defaults; do not mutate AutoForm state directly.
- Maintain keyboard accessibility within the dialog table; ensure search input focuses by default and actions have visible focus states.
