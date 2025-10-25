Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.sellers.new.tsx
Additional rules
- Keep the vendor list sorted and limited to fields required by AutoForm; large datasets should move to paginated selectors.
- Replace hard `window.location.href` redirects with router navigation before launching to production to avoid full reloads.
- Ensure form sections stay responsive (single column on mobile, two/three columns on larger breakpoints) when adding fields.
- Preserve `SubmitResultBanner` so validation errors stay visible; do not suppress it when customizing the layout.
