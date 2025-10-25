Inherits: .cursorrules/rules/pages/DEFAULT.md
Route file: web/routes/_app.admin.vendors.new.tsx
Additional rules
- Keep success navigation pointing to the new vendor detail; update both this route and detail route together if pathing changes.
- Ensure form fields map 1:1 with vendor model properties; avoid introducing implicit defaults outside the model layer.
- Maintain responsive grid breakpoints so the form stays readable on mobile (<768px renders single column).
- Retain `SubmitResultBanner` for surfacing validation and API errors.
