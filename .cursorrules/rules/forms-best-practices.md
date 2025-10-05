Complex Form Best Practices (repo-aligned)

- Components and styling
  - Use existing shadcn/ui primitives from `web/components/ui/*` for inputs, selects, checkboxes, radios, dialogs.
  - Keep labels, descriptions, and error messages consistent with current patterns.

- State and validation
  - Use controlled components with local state; keep validation synchronous where possible.
  - Mirror client and server validation rules; prevent duplicates/overlaps early.
  - Represent draft vs. published explicitly; avoid implicit autosave without clear UX.

- Domain rules (example from article)
  - ZIP/postal validation with normalization and de-duplication.
  - Pricing overrides with a clear toggle for free-delivery and conditional fields.
  - Duplication and deletion flows must be explicit and confirmable.

- Data and actions (Gadget)
  - Keep create/update/delete logic in model actions under `api/models/*/actions/*`.
  - Enforce invariants server-side; client-side validation is additive, not authoritative.
  - Prefer idempotent actions; handle conflict errors gracefully in UI.

- UX and a11y
  - Keyboard navigation and focus management for dialogs and forms.
  - Inline, actionable error messages; avoid alert-only flows.
  - Disable destructive actions when not permitted; show confirmation with context.

- Performance
  - Avoid heavy recomputation in renders; memoize derived data where useful.
  - For large lists (e.g., ZIPs), debounce inputs and validate in batches.

- Dependencies
  - Do not add new libraries without explicit approval.
  - If form libs (`react-hook-form`, schema validators) are introduced later, migrate incrementally.

